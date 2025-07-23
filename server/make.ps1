function Generate-Code {
    Write-Host "Generating code..." -ForegroundColor Cyan
    go generate .\apiServer\db.go
    if ($LASTEXITCODE -ne 0) {
        throw "Code generation failed"
    }
}
function Build-Project {
    param(
        [string]$OutputFile = "server.exe"
    )
    # 文件名合法性校验（只允许字母数字和下划线）
    if ($OutputFile -notmatch '^[\w\.-]+\.exe$') {
        throw "Invalid filename. Use alphanumeric names (e.g. 'myapp.exe')"
    }
    Write-Host "Building project as $OutputFile..." -ForegroundColor Cyan
    go build -o $OutputFile main.go
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    return $OutputFile
}

function Run-Project {
    param(
        [string]$Executable,
        [switch]$InCurrentWindow
    )
    Write-Host "Starting $Executable..." -ForegroundColor Cyan

    if ($InCurrentWindow) {
        # 在当前窗口运行（阻塞式）
        Write-Host "Running in current window (press Ctrl+C to stop)..." -ForegroundColor Yellow
        & "./$Executable"
    }
    else {
        # 在新窗口运行（非阻塞）
        Start-Process pwsh -ArgumentList "-NoExit", "-Command", "& './$Executable'"
    }
}

#region 上下键选择菜单函数
function Show-InteractiveMenu {
    $options = @(
        "[Full] Generate + Build + Run",
        "[Generate] Code generation only",
        "[Build & Run] Skip generation",
        "[Build] Compile only"
    )
    $selected = 0
    $enterPressed = $false

    while (-not $enterPressed) {
        Clear-Host
        Write-Host "`n=== Go Project Automation Menu ===" -ForegroundColor Yellow
        Write-Host "Use UP/DOWN arrows to navigate, ENTER to select`n" -ForegroundColor DarkGray

        for ($i = 0; $i -lt $options.Length; $i++) {
            if ($i -eq $selected) {
                Write-Host "> $($options[$i])" -ForegroundColor Green
            } else {
                Write-Host "  $($options[$i])"
            }
        }

        $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown").VirtualKeyCode
        switch ($key) {
            38 { if ($selected -gt 0) { $selected-- } }        # 上箭头
            40 { if ($selected -lt $options.Length - 1) { $selected++ } } # 下箭头
            13 { $enterPressed = $true }                       # 回车
        }
    }
    return $selected + 1
}
#endregion

#region 主逻辑
try {
    # 显示交互式菜单并获取选择
    $choice = Show-InteractiveMenu
    $executableName = "server.exe"  # 默认文件名

    switch ($choice) {
        1 {
            Write-Host "`n[Selected] Full workflow`n" -ForegroundColor Green
            Generate-Code

            # 请求自定义文件名
            $input = Read-Host "Enter output filename [Press ENTER for 'server.exe']"
            if (-not [string]::IsNullOrWhiteSpace($input)) {
                $executableName = $input
            }

            Build-Project -OutputFile $executableName

            # 询问窗口模式
            $windowChoice = Read-Host "Run in new window? (Y/n) [Default: Y]"
            $runInCurrentWindow = ($windowChoice -eq "n" -or $windowChoice -eq "N")

            Run-Project -Executable $executableName -InCurrentWindow:$runInCurrentWindow
        }
        2 {
            Write-Host "`n[Selected] Code generation`n" -ForegroundColor Green
            Generate-Code
        }
        3 {
            Write-Host "`n[Selected] Build & Run`n" -ForegroundColor Green

            # 请求自定义文件名
            $input = Read-Host "Enter output filename [Press ENTER for 'server.exe']"
            if (-not [string]::IsNullOrWhiteSpace($input)) {
                $executableName = $input
            }

            $executableName = Build-Project -OutputFile $executableName

            # 询问窗口模式
            $windowChoice = Read-Host "Run in new window? (Y/n) [Default: Y]"
            $runInCurrentWindow = ($windowChoice -eq "n" -or $windowChoice -eq "N")

            Run-Project -Executable $executableName -InCurrentWindow:$runInCurrentWindow
        }
        4 {
            Write-Host "`n[Selected] Build only`n" -ForegroundColor Green

            # 请求自定义文件名
            $input = Read-Host "Enter output filename [Press ENTER for 'server.exe']"
            if (-not [string]::IsNullOrWhiteSpace($input)) {
                $executableName = $input
            }

            Build-Project -OutputFile $executableName
        }
        default {
            throw "Invalid selection"
        }
    }
}
catch {
    Write-Host "`nError: $_" -ForegroundColor Red
    exit 1
}
#endregion

Write-Host "`nOperation completed" -ForegroundColor Green
exit 0