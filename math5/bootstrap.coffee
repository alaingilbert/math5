initialize = ->
  mathElements = document.querySelectorAll '.math'
  for mathElement in mathElements
    new Math5 mathElement


document.addEventListener 'DOMContentLoaded', -> do initialize
