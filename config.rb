http_path = "/"
sass_dir = "/html/_scss"
css_dir = "/html/assets/css"
javascripts_dir = "/html/assets/js"
images_dir = "/html/assets/img"
Encoding.default_external = "UTF-8"
output_style = (environment == :production) ? :compressed : :expanded
sourcemap = (environment == :production) ? false : true
line_comments = false
