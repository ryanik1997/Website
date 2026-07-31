<#
.SYNOPSIS
  Auto-init Hermes memory for a new project.
.DESCRIPTION
  Scans project, detects stack/git/scripts, generates SOUL.md + memories/.
.PARAMETER ProjectPath
  Path to project (required).
.PARAMETER Name
  Project name (auto-detected if omitted).
.PARAMETER Description
  Project description.
.PARAMETER OutDir
  Output directory (default: $env:LOCALAPPDATA\hermes).
.PARAMETER Force
  Overwrite existing SOUL.md/MEMORY.md/project-architecture.md.
.EXAMPLE
  .\hermes-init.ps1 D:\MyProject
.EXAMPLE
  .\hermes-init.ps1 D:\MyProject -Name "My App" -Desc "React dashboard" -Force
#>

param(
  [Parameter(Mandatory, Position=0)]
  [string]$ProjectPath,

  [string]$Name = "",
  [string]$Desc = "",
  [string]$OutDir = "",
  [switch]$Force
)

$ErrorActionPreference = "Stop"

# --- defaults ---
if (-not $OutDir) { $OutDir = "$env:LOCALAPPDATA\hermes" }
$MemDir = "$OutDir\memories"
[System.IO.Directory]::CreateDirectory($MemDir) | Out-Null

$ProjectPath = [System.IO.Path]::GetFullPath($ProjectPath)
if (-not (Test-Path $ProjectPath -PathType Container)) {
  Write-Error "Not a directory: $ProjectPath"; exit 1
}

Write-Host "Scanning $ProjectPath ..." -ForegroundColor Cyan

# --- detect name ---
$PkgJson = Join-Path $ProjectPath "package.json"
$PnpmYaml = Join-Path $ProjectPath "pnpm-workspace.yaml"
$pkg = $null

if (-not $Name -and (Test-Path $PkgJson)) {
  try { $pkg = Get-Content $PkgJson -Raw | ConvertFrom-Json; $Name = $pkg.name } catch {}
}
if (-not $Name) { $Name = Split-Path $ProjectPath -Leaf }
if (-not $Desc -and $pkg -and $pkg.description) { $Desc = $pkg.description }

# --- stack labels ---
$labels = @()
$details = @()

if (Test-Path $PkgJson) {
  $labels += "Node.js"
  if (-not $pkg) { try { $pkg = Get-Content $PkgJson -Raw | ConvertFrom-Json } catch {} }

  # workspaces
  $ws = @()
  if (Test-Path $PnpmYaml) {
    $details += "Package manager: pnpm (workspaces)"
    $yaml = Get-Content $PnpmYaml -Raw
    $ws = [regex]::Matches($yaml, '^\s*-\s*(.+)$', 'Multiline') | % { $_.Groups[1].Value.Trim("'`"") }
  } elseif ($pkg.workspaces) {
    $details += "Package manager: npm/yarn (workspaces)"
    $ws = @($pkg.workspaces)
  } else {
    $details += "Package manager: npm/pnpm/yarn"
  }
  if ($ws.Count -gt 0) { $labels += "Monorepo" }

  # deps
  $deps = @()
  if ($pkg.dependencies)    { $deps += $pkg.dependencies.PSObject.Properties.Name }
  if ($pkg.devDependencies) { $deps += $pkg.devDependencies.PSObject.Properties.Name }
  $d = $deps -join "`n"

  if ($d -match "`nreact(-dom)?`$" -or $d -match "`ncreate-react-app") { $labels += "React" }
  elseif ($d -match "`nvue`$")    { $labels += "Vue" }
  elseif ($d -match "angular")    { $labels += "Angular" }
  if ($d -match "`nvite`$")       { $labels += "Vite" }
  if ($d -match "`nnext`$")       { $labels += "Next.js" }
  if ($d -match "`ntypescript`$") { $labels += "TypeScript" }
  if ($d -match "`ntailwindcss`$") { $labels += "Tailwind" }
  if ($d -match "`nsupabase`$")   { $labels += "Supabase" }
  if ($d -match "`ndexie`$")      { $labels += "IndexedDB" }
  if ($d -match "`nzustand`$|`nredux`$") { $labels += "State Mgmt" }

  # scripts
  $dev  = if ($pkg.scripts.dev)   { $pkg.scripts.dev   } elseif ($pkg.scripts.start) { $pkg.scripts.start } else { "" }
  $bld  = if ($pkg.scripts.build) { $pkg.scripts.build } else { "" }
  $tst  = if ($pkg.scripts.test)  { $pkg.scripts.test  } else { "" }
}

# python
$py = Join-Path $ProjectPath "pyproject.toml"
$req = Join-Path $ProjectPath "requirements.txt"
if ((Test-Path $py) -or (Test-Path $req)) { $labels += "Python" }

# other langs
foreach ($pair in @(@{f="Cargo.toml";l="Rust"},@{f="go.mod";l="Go"},@{f="Gemfile";l="Ruby"},@{f="composer.json";l="PHP"})) {
  if (Test-Path (Join-Path $ProjectPath $pair.f)) { $labels += $pair.l }
}

# git
$gitRemote = ""; $gitBranch = ""
try { Push-Location $ProjectPath
  $gitRemote = git remote get-url origin 2>$null
  $gitBranch = git branch --show-current 2>$null
} catch {} finally { Pop-Location }

$stack = $labels -join " + "
Write-Host "  Name: $Name | Stack: $stack" -ForegroundColor Yellow
if ($Desc) { Write-Host "  Desc: $Desc" }
if ($gitRemote) { Write-Host "  Git: $gitRemote" }

# --- check existing ---
$existing = @()
foreach ($f in @("SOUL.md","memories\MEMORY.md","memories\USER.md","memories\project-architecture.md")) {
  $fp = Join-Path $OutDir $f
  if (Test-Path $fp) { $existing += $fp }
}
if ($existing.Count -gt 0 -and -not $Force) {
  Write-Warning "Files exist; use -Force to overwrite"
  foreach ($f in $existing) { Write-Host "   $f" }
  exit 0
}

# Helper to write file
function Write-File($path, $lines) {
  $lines -join "`r`n" | Out-File -FilePath $path -Encoding utf8 -Force
  Write-Host "  -> $((Get-Item $path).Name)" -ForegroundColor Green
}

# --- build SOUL.md ---
$soul = @()
$soul += "You are Hermes Agent, an intelligent AI assistant created by Nous Research. You are working on the project below. Be helpful, direct, and efficient."
$soul += ""
$soul += "## Project context -- $Name"
$soul += "- Path: $ProjectPath"
$soul += "- Stack: $stack"
if ($gitRemote)  { $soul += "- Git: $gitRemote" }
if ($gitBranch)  { $soul += "- Branch: $gitBranch" }
if ($ws.Count -gt 0)  { $soul += "- Workspaces: $($ws -join ', ')" }
$soul += ""
$soul += "## Key commands"
if ($dev)  { $soul += "- Dev: $dev" } else { $soul += "- Dev: (not detected)" }
if ($bld)  { $soul += "- Build: $bld" }
if ($tst)  { $soul += "- Test: $tst" }
$soul += ""
$soul += "## Rules khi lam viec"
$soul += "- Doc session_summary.md truoc (neu co)"
$soul += "- Output style: i-have-adhd (next action dau tien, gon, so hoa steps)"
$soul += "- Cap nhat session_summary.md sau moi session"
$soul += ""
$soul += "## Knowledge base"
$soul += '- Thu muc `memories/` chua kien thuc du an'
$soul += '  - `project-architecture.md` -- kien truc tong quan'
$soul += '  - `MEMORY.md` -- project facts va conventions'
$soul += '  - `USER.md` -- user profile'

Write-File "$OutDir\SOUL.md" $soul

# --- build MEMORY.md ---
$mem = @()
$mem += "# MEMORY.md -- Persistent Knowledge"
$mem += ""
$mem += "## Project: $Name"
$mem += "- Path: $ProjectPath"
$mem += "- Stack: $stack"
if ($gitRemote) { $mem += "- Git: $gitRemote" }
if ($Desc)      { $mem += "- Desc: $Desc" }
$mem += ""
$mem += "## Commands"
if ($dev)  { $mem += "- Dev: ``$dev``" }
if ($bld)  { $mem += "- Build: ``$bld``" }
if ($tst)  { $mem += "- Test: ``$tst``" }
$mem += ""
$mem += "## Conventions"
$mem += "- Read session_summary.md before starting work"
$mem += "- Update session_summary.md after each completed patch/feature"
$mem += "- Output: i-have-adhd (gon, next action dau tien, so hoa steps)"

Write-File "$MemDir\MEMORY.md" $mem

# --- build USER.md ---
$userFile = "$MemDir\USER.md"
$user = @()
$user += "# USER.md -- User Profile"
$user += ""
$user += "## Identity"
$user += "- Name: (ask user)"
$user += "- Language:"
$user += "- Role:"
$user += ""
$user += "## Preferences"
$user += "- Work:"
$user += "- Output style: i-have-adhd"
$user += "- Tools:"
$user += ""
$user += "## Communication Style"
$user += "- (ask user)"

if (-not (Test-Path $userFile) -or $Force) {
  Write-File $userFile $user
} else {
  Write-Host "  -> USER.md (kept existing)" -ForegroundColor DarkYellow
}

# --- build project-architecture.md ---
$arc = @()
$arc += "# $Name -- Project Architecture"
if ($Desc) { $arc += "> $Desc" }
$arc += ""
$arc += "## Stack"
$arc += $stack
if ($ws.Count -gt 0) {
  $arc += ""
  $arc += "## Workspace layout"
  $ws | % { $arc += "- $_" }
}
if ($gitRemote) {
  $arc += ""
  $arc += "## Repository"
  $arc += "- Remote: $gitRemote"
  if ($gitBranch) { $arc += "- Branch: $gitBranch" }
}
$arc += ""
$arc += "## Key rules"
$arc += "- Update session_summary.md after each session"
$arc += "- Output: i-have-adhd"

Write-File "$MemDir\project-architecture.md" $arc

# --- summary ---
Write-Host ""
Write-Host "====" -ForegroundColor Cyan
Write-Host "Hermes now knows about $Name!" -ForegroundColor Green
Write-Host "Location: $OutDir" -ForegroundColor Cyan
Write-Host "===="
