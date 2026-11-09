Add-Type -AssemblyName System.Drawing
$iconDir = Join-Path $PSScriptRoot '..\icons'
New-Item -ItemType Directory -Path $iconDir -Force | Out-Null
$bitmap = [System.Drawing.Bitmap]::new(512, 512)
$g = [System.Drawing.Graphics]::FromImage($bitmap)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::Transparent)
$background = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#F3DFCF'))
$line = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#BF7655'), 42)
$line.StartCap = $line.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$dark = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#35343A'))
$path = [System.Drawing.Drawing2D.GraphicsPath]::new()
$path.AddArc(0, 0, 144, 144, 180, 90)
$path.AddArc(368, 0, 144, 144, 270, 90)
$path.AddArc(368, 368, 144, 144, 0, 90)
$path.AddArc(0, 368, 144, 144, 90, 90)
$path.CloseFigure()
$g.FillPath($background, $path)
$g.DrawLine($line, 256, 88, 256, 424)
$g.DrawLine($line, 88, 256, 424, 256)
$g.DrawLine($line, 137, 137, 375, 375)
$g.DrawLine($line, 375, 137, 137, 375)
$g.FillRectangle($background, 326, 308, 160, 176)
$shield = [System.Drawing.Drawing2D.GraphicsPath]::new()
$shield.AddLine(400, 316, 462, 337)
$shield.AddLine(462, 337, 462, 400)
$shield.AddBezier(462, 400, 462, 439, 428, 461, 400, 476)
$shield.AddBezier(400, 476, 372, 461, 338, 439, 338, 400)
$shield.AddLine(338, 400, 338, 337)
$shield.CloseFigure()
$g.FillPath($dark, $shield)
$check = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#FFF6E9'), 13)
$check.StartCap = $check.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawLines($check, [System.Drawing.Point[]]@([System.Drawing.Point]::new(368, 398), [System.Drawing.Point]::new(390, 420), [System.Drawing.Point]::new(432, 370)))
$pngPath = Join-Path $iconDir 'icon.png'
$bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bitmap.Dispose(); $background.Dispose(); $line.Dispose(); $dark.Dispose(); $path.Dispose(); $shield.Dispose(); $check.Dispose()
$png = [System.IO.File]::ReadAllBytes($pngPath)
$icoPath = Join-Path $iconDir 'icon.ico'
$stream = [System.IO.File]::Create($icoPath)
$writer = [System.IO.BinaryWriter]::new($stream)
$writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]1)
$writer.Write([byte]0); $writer.Write([byte]0); $writer.Write([byte]0); $writer.Write([byte]0)
$writer.Write([uint16]1); $writer.Write([uint16]32); $writer.Write([uint32]$png.Length); $writer.Write([uint32]22)
$writer.Write($png); $writer.Dispose()
# ICNS ic09 is a 512 px PNG payload.
$icnsPath = Join-Path $iconDir 'icon.icns'
$stream = [System.IO.File]::Create($icnsPath)
$writer = [System.IO.BinaryWriter]::new($stream)
$writeBigEndian = {
  param([System.IO.BinaryWriter]$w, [uint32]$n)
  $w.Write([byte](($n -shr 24) -band 255)); $w.Write([byte](($n -shr 16) -band 255))
  $w.Write([byte](($n -shr 8) -band 255)); $w.Write([byte]($n -band 255))
}
$writer.Write([System.Text.Encoding]::ASCII.GetBytes('icns'))
& $writeBigEndian $writer ([uint32]($png.Length + 16))
$writer.Write([System.Text.Encoding]::ASCII.GetBytes('ic09'))
& $writeBigEndian $writer ([uint32]($png.Length + 8))
$writer.Write($png); $writer.Dispose()
