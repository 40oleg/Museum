using System;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

// Runs the real system dialog on a private, non-interactive desktop.
public static class MuseumDialogSmoke {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct StartupInfo {
        public int size;
        public string reserved, desktop, title;
        public int x, y, width, height, columns, rows, fill, flags;
        public short show, unused;
        public IntPtr bytes, input, output, error;
    }
    [StructLayout(LayoutKind.Sequential)]
    private struct ProcessInfo {
        public IntPtr process, thread;
        public int id, threadId;
    }
    private delegate bool Enumerate(IntPtr window, IntPtr parameter);
    [DllImport("user32", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr CreateDesktop(string name, IntPtr device, IntPtr mode, uint flags, uint access, IntPtr security);
    [DllImport("user32")] private static extern bool CloseDesktop(IntPtr desktop);
    [DllImport("user32")] private static extern bool EnumDesktopWindows(IntPtr desktop, Enumerate callback, IntPtr data);
    [DllImport("user32")] private static extern uint GetWindowThreadProcessId(IntPtr window, out int id);
    [DllImport("user32", CharSet = CharSet.Unicode)] private static extern int GetWindowText(IntPtr window, StringBuilder title, int capacity);
    [DllImport("user32")] private static extern bool PostMessage(IntPtr window, int message, IntPtr wParam, IntPtr lParam);
    [DllImport("kernel32", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool CreateProcess(string exe, StringBuilder args, IntPtr procAttr, IntPtr threadAttr,
        bool inherit, uint flags, IntPtr environment, string directory, ref StartupInfo startup, out ProcessInfo info);
    [DllImport("kernel32")] private static extern bool CloseHandle(IntPtr handle);

    [DllImport("kernel32")] private static extern uint WaitForSingleObject(IntPtr handle, uint ms);
    [DllImport("kernel32")] private static extern bool GetExitCodeProcess(IntPtr handle, out uint code);
    [DllImport("kernel32")] private static extern bool TerminateProcess(IntPtr handle, uint code);

    private static uint ExitCode(IntPtr process) {
        uint code;
        if (!GetExitCodeProcess(process, out code)) throw new Win32Exception();
        return code;
    }

    private static IntPtr WaitForDialog(IntPtr desktop, ProcessInfo process, IntPtr previous) {
        var timeout = Stopwatch.StartNew();
        while (timeout.ElapsedMilliseconds < 12000) {
            if (WaitForSingleObject(process.process, 0) == 0) throw new Exception("Dialog process exited early: " + ExitCode(process.process));
            IntPtr found = IntPtr.Zero;
            EnumDesktopWindows(desktop, delegate(IntPtr window, IntPtr unused) {
                int id;
                GetWindowThreadProcessId(window, out id);
                if (id != process.id || window == previous) return true;
                var title = new StringBuilder(128);
                GetWindowText(window, title, title.Capacity);
                if (title.ToString() != "Настройки Museum") return true;
                found = window;
                return false;
            }, IntPtr.Zero);
            if (found != IntPtr.Zero) return found;
            Thread.Sleep(30);
        }
        throw new TimeoutException("Timed out waiting for Museum settings.");
    }
    private static void Click(IntPtr window, int message, int id) {
        if (!PostMessage(window, 1024 + message, (IntPtr)id, IntPtr.Zero))
            throw new Exception("Could not drive the task dialog.");
    }
    private static ProcessInfo Start(string exe, string name) {
        var startup = new StartupInfo();
        startup.size = Marshal.SizeOf(startup);
        startup.desktop = name;
        ProcessInfo info;
        if (!CreateProcess(exe, null, IntPtr.Zero, IntPtr.Zero, false, 0x08000000, IntPtr.Zero,
            null, ref startup, out info)) throw new Win32Exception();
        return info;
    }
    private static void CloseProcess(ProcessInfo info) {
        if (WaitForSingleObject(info.process, 0) != 0) {
            TerminateProcess(info.process, 1);
            WaitForSingleObject(info.process, 5000);
        }
        CloseHandle(info.thread);
        CloseHandle(info.process);
    }
    public static void Run(string exe, string packageState) {
        string name = "MuseumSmoke" + Guid.NewGuid().ToString("N");
        IntPtr desktop = CreateDesktop(name, IntPtr.Zero, IntPtr.Zero, 0, 0x1ff, IntPtr.Zero);
        if (desktop == IntPtr.Zero) throw new Win32Exception();
        try {
            ProcessInfo info = Start(exe, name);
            try {
                IntPtr first = WaitForDialog(desktop, info, IntPtr.Zero);
                Click(first, 110, 201); // TDM_CLICK_RADIO_BUTTON
                if (String.IsNullOrEmpty(packageState)) Click(first, 113, 1); // TDM_CLICK_VERIFICATION
                Click(first, 102, 100); // TDM_CLICK_BUTTON (Save)
                if (!String.IsNullOrEmpty(packageState)) {
                    var timeout = Stopwatch.StartNew();
                    while (!File.Exists(packageState) && timeout.ElapsedMilliseconds < 5000) Thread.Sleep(30);
                    if (!File.Exists(packageState)) throw new Exception("The owner did not save the settings.");
                    ProcessInfo launcher = Start(exe, name);
                    try {
                        if (WaitForSingleObject(launcher.process, 5000) != 0 || ExitCode(launcher.process) != 0)
                            throw new Exception("A second launch should notify the owner and exit.");
                    } finally { CloseProcess(launcher); }
                }
                IntPtr second = WaitForDialog(desktop, info, first);
                Click(second, 102, 2);  // IDCANCEL
                if (String.IsNullOrEmpty(packageState)) {
                    IntPtr third = WaitForDialog(desktop, info, second);
                    Click(third, 102, 101); // Restore
                } else {
                    using (var stop = EventWaitHandle.OpenExisting(@"Local\Museum.Native.Stop")) stop.Set();
                }
                if (WaitForSingleObject(info.process, 5000) != 0 || ExitCode(info.process) != 0)
                    throw new Exception("Settings assertions failed.");
            } finally {
                CloseProcess(info);
            }
        } finally { CloseDesktop(desktop); }
    }
}
