$file = 'src\app\AdminView.tsx'
$content = Get-Content $file -Raw
$content = $content -replace 'nm-flat', 'glass-panel'
$content = $content -replace 'nm-inset-sm', 'bg-black/40 border border-white/10 rounded-xl'
$content = $content -replace 'nm-inset', 'bg-white/[0.03] border border-white/5 rounded-xl'
$content = $content -replace 'nm-button-primary', 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]'
$content = $content -replace 'nm-button', 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
$content = $content -replace 'text-nm-primary', 'text-white'
$content = $content -replace 'text-nm-secondary', 'text-slate-400'
$content = $content -replace 'bg-nm-bg', 'bg-black/40'
$content = $content -replace 'border-nm-primary', 'border-white/10'
Set-Content $file $content -NoNewline
Write-Host 'Classes substituidas com sucesso!'
