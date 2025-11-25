Coloque os arquivos de ícone nesta pasta para que o app os use:

- /public/favicon.ico        (favicon clássico)
- /public/apple-touch-icon.png  (ícone para telas iOS, 180x180)
- /public/icons/icon-192.png    (ícone PWA 192x192)
- /public/icons/icon-512.png    (ícone PWA 512x512)

Como gerar ícones (exemplo usando ImageMagick):

magick convert source.png -resize 192x192 public/icons/icon-192.png
magick convert source.png -resize 512x512 public/icons/icon-512.png
magick convert source.png -resize 180x180 public/apple-touch-icon.png
magick convert source.png -resize 32x32  public/favicon.ico

Se você preferir, envie o arquivo de ícone aqui (PNG ou ICO) e eu coloco nos caminhos acima e atualizo automaticamente `index.html` e `public/site.webmanifest`.
