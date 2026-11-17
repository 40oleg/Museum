#requires -Version 5.1
<#
.SYNOPSIS
    Build the 151 annotated Museum wallpapers and their UTF-8 catalog.
.PARAMETER PreviewIndex
    Build only the selected JPEG, for checking the rendering in a separate directory.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$OutputDirectory,

    [ValidateRange(0, 150)]
    [int]$PreviewIndex
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

function New-RoundedRectangle {
    param([Drawing.RectangleF]$Bounds, [single]$Radius)

    $diameter = 2 * [Math]::Min($Radius, [Math]::Min($Bounds.Width, $Bounds.Height) / 2)
    $path = [Drawing.Drawing2D.GraphicsPath]::new()
    $path.AddArc($Bounds.Left, $Bounds.Top, $diameter, $diameter, 180, 90)
    $path.AddArc($Bounds.Right - $diameter, $Bounds.Top, $diameter, $diameter, 270, 90)
    $path.AddArc($Bounds.Right - $diameter, $Bounds.Bottom - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($Bounds.Left, $Bounds.Bottom - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    return $path
}

function Write-Wallpaper {
    param([string]$SourcePath, [string]$TargetPath, [pscustomobject]$Entry)

    $image = [Drawing.Image]::FromFile($SourcePath, $true)
    try {
        $canvas = [Drawing.Bitmap]::new($canvasWidth, $canvasHeight, [Drawing.Imaging.PixelFormat]::Format24bppRgb)
        try {
            $graphics = [Drawing.Graphics]::FromImage($canvas)
            try {
                $graphics.Clear([Drawing.ColorTranslator]::FromHtml('#222222'))
                $graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
                $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::Half
                $graphics.TextRenderingHint = [Drawing.Text.TextRenderingHint]::AntiAliasGridFit

                # Match pattern.js at the fixed 4K viewport, where 1vw is 38.4 px.
                $padding = $vw
                $rightMargin = 2 * $vw
                $bottomMargin = 3 * $vw
                $rows = @(
                    @{ Text = $category; Font = $categoryFont; Brush = $muted; Margin = 0; LineHeight = 0 }
                    @{ Text = $Entry.author; Font = $authorFont; Brush = $light; Margin = 0.4 * $vw; LineHeight = 0 }
                    @{ Text = $Entry.name; Font = $titleFont; Brush = $light; Margin = $vw; LineHeight = 0 }
                    @{ Text = $Entry.years; Font = $yearFont; Brush = $muted; Margin = 0.8 * $vw; LineHeight = 1.8 * $yearFont.Size }
                )

                $contentWidth = [Math]::Max($image.Width, 27 * $vw)
                foreach ($row in $rows) {
                    $textSize = $graphics.MeasureString($row.Text, $row.Font, [Drawing.PointF]::Empty, $textFormat)
                    $contentWidth = [Math]::Max($contentWidth, $textSize.Width)
                }
                $contentWidth = [Math]::Min($contentWidth, 35 * $vw)

                $textHeight = 0
                $measureBounds = [Drawing.SizeF]::new($contentWidth, $canvasHeight)
                foreach ($row in $rows) {
                    $measuredHeight = [Math]::Ceiling($graphics.MeasureString($row.Text, $row.Font, $measureBounds, $textFormat).Height)
                    $row.Height = [Math]::Max($measuredHeight, $row.LineHeight)
                    $row.Inset = ($row.Height - $measuredHeight) / 2
                    $textHeight += $row.Margin + $row.Height
                }

                $imageMargin = 1.8 * $vw
                $cardChrome = 2 * ($padding + 1) + $textHeight + $imageMargin
                # Keep all lettering visible for tall originals while preserving their aspect ratio.
                $availableHeight = $canvasHeight - $bottomMargin - $rightMargin - $cardChrome
                $scale = [Math]::Min($contentWidth / $image.Width, $availableHeight / $image.Height)
                $imageWidth = $image.Width * $scale
                $imageHeight = $image.Height * $scale
                $cardWidth = $contentWidth + 2 * ($padding + 1)
                $cardHeight = $cardChrome + $imageHeight
                $cardLeft = $canvasWidth - $rightMargin - $cardWidth
                $cardTop = $canvasHeight - $bottomMargin - $cardHeight
                $left = $cardLeft + $padding + 1
                $top = $cardTop + $padding + 1

                $cardBounds = [Drawing.RectangleF]::new($cardLeft + 0.5, $cardTop + 0.5, $cardWidth - 1, $cardHeight - 1)
                $border = New-RoundedRectangle $cardBounds (1.5 * $vw)
                try { $graphics.DrawPath($outline, $border) } finally { $border.Dispose() }

                foreach ($row in $rows) {
                    $top += $row.Margin
                    $textBounds = [Drawing.RectangleF]::new($left, ($top + $row.Inset), $contentWidth, $row.Height)
                    $graphics.DrawString($row.Text, $row.Font, $row.Brush, $textBounds, $textFormat)
                    $top += $row.Height
                }

                $imageBounds = [Drawing.RectangleF]::new($left, $top + $imageMargin, $imageWidth, $imageHeight)
                $imageClip = New-RoundedRectangle $imageBounds $vw
                try {
                    $graphics.SetClip($imageClip)
                    $graphics.DrawImage($image, $imageBounds)
                }
                finally { $imageClip.Dispose() }
            }
            finally { $graphics.Dispose() }

            $canvas.Save($TargetPath, $jpegCodec, $jpegOptions)
        }
        finally { $canvas.Dispose() }
    }
    finally { $image.Dispose() }

    $stream = [IO.File]::OpenRead($TargetPath)
    try {
        $result = [Drawing.Image]::FromStream($stream, $false, $true)
        try {
            if ($result.Width -ne $canvasWidth -or $result.Height -ne $canvasHeight -or
                $result.RawFormat.Guid -ne [Drawing.Imaging.ImageFormat]::Jpeg.Guid) {
                throw "Invalid wallpaper output '$TargetPath'. Expected a ${canvasWidth}x${canvasHeight} JPEG."
            }
        }
        finally { $result.Dispose() }
    }
    finally { $stream.Dispose() }
}

$assets = Join-Path $PSScriptRoot '../../util/creating-wallpapers'
$paintings = Join-Path $assets 'paintings'
$utf8 = [Text.UTF8Encoding]::new($false, $true)
$catalogSource = Join-Path $paintings 'paintings.json'
$entries = [object[]](ConvertFrom-Json -InputObject ([IO.File]::ReadAllText($catalogSource, $utf8)))
if ($entries.Count -ne 151) {
    throw "Expected 151 paintings in '$catalogSource', found $($entries.Count)."
}

$catalog = @(for ($index = 0; $index -lt $entries.Count; $index++) {
    $entry = $entries[$index]
    foreach ($property in 'file', 'name', 'author', 'years') {
        if ($entry.$property -isnot [string] -or [string]::IsNullOrWhiteSpace($entry.$property)) {
            throw "Painting $index needs a nonempty '$property' string."
        }
    }
    if ($entry.file -ne [IO.Path]::GetFileName($entry.file) -or
        !(Test-Path -LiteralPath (Join-Path $paintings $entry.file) -PathType Leaf)) {
        throw "The source artwork for painting $index ('$($entry.file)') is missing or invalid."
    }
    [pscustomobject]@{
        file = "$index.jpg"
        name = $entry.name
        author = $entry.author
        years = $entry.years
    }
})

$destination = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutputDirectory)
$stage = Join-Path $destination ('.prepare-paintings-' + [Guid]::NewGuid().ToString('N'))
$null = [IO.Directory]::CreateDirectory($stage)
$resources = [Collections.Generic.List[IDisposable]]::new()
try {
    $canvasWidth = 3840
    $canvasHeight = 2160
    $vw = $canvasWidth / 100
    $category = 'ИЗОБРАЗИТЕЛЬНОЕ ИСКУССТВО'
    $muted = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#7a7b79'))
    $light = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#e3e3e3'))
    $outline = [Drawing.Pen]::new([Drawing.ColorTranslator]::FromHtml('#686967'), 1)
    $textFormat = [Drawing.StringFormat]::GenericTypographic
    $resources.AddRange([IDisposable[]]@($muted, $light, $outline, $textFormat))

    $fontSets = @{}
    foreach ($weight in 'Regular', 'Bold', 'ExtraBold') {
        $fontSet = [Drawing.Text.PrivateFontCollection]::new()
        $resources.Add($fontSet)
        $fontSet.AddFontFile((Join-Path $assets "fonts/Manrope-$weight.ttf"))
        $fontSets[$weight] = $fontSet
    }
    $fontUnit = [Drawing.GraphicsUnit]::Pixel
    $regular = [Drawing.FontStyle]::Regular
    $categoryFont = [Drawing.Font]::new($fontSets.Regular.Families[0], 0.8 * $vw, $regular, $fontUnit)
    $authorFont = [Drawing.Font]::new($fontSets.ExtraBold.Families[0], 1.4 * $vw, $regular, $fontUnit)
    $titleFont = [Drawing.Font]::new($fontSets.ExtraBold.Families[0], 1.2 * $vw, $regular, $fontUnit)
    $yearFont = [Drawing.Font]::new($fontSets.Bold.Families[0], 0.8 * $vw, [Drawing.FontStyle]::Bold, $fontUnit)
    $resources.AddRange([IDisposable[]]@($categoryFont, $authorFont, $titleFont, $yearFont))

    $jpegCodec = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
    $jpegOptions = [Drawing.Imaging.EncoderParameters]::new(1)
    $resources.Add($jpegOptions)
    $jpegOptions.Param[0] = [Drawing.Imaging.EncoderParameter]::new([Drawing.Imaging.Encoder]::Quality, [long]90)

    $preview = $PSBoundParameters.ContainsKey('PreviewIndex')
    $indices = if ($preview) { $PreviewIndex } else { 0..($entries.Count - 1) }
    foreach ($index in $indices) {
        $sourcePath = Join-Path $paintings $entries[$index].file
        $targetPath = Join-Path $stage $catalog[$index].file
        try { Write-Wallpaper $sourcePath $targetPath $catalog[$index] }
        catch { throw "Could not render painting $index from '$sourcePath'. $($_.Exception.Message)" }
    }

    $outputFiles = @($indices | ForEach-Object { $catalog[$_].file })
    if (!$preview) {
        $catalogJson = ConvertTo-Json -InputObject $catalog -Depth 2
        [IO.File]::WriteAllText((Join-Path $stage 'catalog.json'), $catalogJson + "`n", $utf8)
        $outputFiles += 'catalog.json'
    }

    foreach ($file in $outputFiles) {
        $stagedFile = Join-Path $stage $file
        $destinationFile = Join-Path $destination $file
        if ([IO.File]::Exists($destinationFile)) {
            [IO.File]::Replace($stagedFile, $destinationFile, [NullString]::Value)
        }
        else {
            [IO.File]::Move($stagedFile, $destinationFile)
        }
    }
    if (!$preview) {
        Write-Host "Prepared $($entries.Count) Museum wallpapers in '$destination'."
    }
}
finally {
    for ($index = $resources.Count - 1; $index -ge 0; $index--) { $resources[$index].Dispose() }
    Get-ChildItem -LiteralPath $stage -File -Force | Remove-Item -Force
    [IO.Directory]::Delete($stage)
}
