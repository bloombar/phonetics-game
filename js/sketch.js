var w = 800
var h = 600
var margin = 30
var spacing = 30
var framerate = 24

// the letters for which we have sound files
var available_letters =
  "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z CH SH TH"
available_letters += " " + available_letters // double them

var OVERLAP_FACTOR = 0.5
var LETTER_SIZE = 50
var MARGIN = 50

var SPACE_KEY = 32

window.onkeydown = function (e) {
  e.preventDefault()
}

var timeline
var letters = []

var bgColorStandard = [0, 0, 0]
var fgColorStandard = [255, 255, 255]
var bgColorInvert = [255, 255, 255]
var fgColorInvert = [0, 0, 0]
var bgColorSuccess = [0, 255, 0]
var fgColorSuccess = [0, 0, 0]
var bgColorFailure = [255, 125, 125]
var fgColorFailure = [0, 0, 0]
var bgColorInfo = [0, 0, 255]
var fgColorInfo = [255, 255, 255]
var soundFiles = []

function preload() {
  // Load the sound file.
  // We have included both an MP3 and an OGG version.
  soundFormats("mp3")
  // preload sounds
  // const ls = available_letters.split(" ")
  // ls.forEach(l => {
  //   const soundFile = loadSound(`./data/${l}1.mp3`)
  //   soundFiles.push(soundFile)
  // })

  // window.soundFileWelcome = loadSound("./data/vibraphon.mp3")
}

function setup() {
  let bgColorStandard = window.bgColorStandard

  createCanvas(windowWidth, windowHeight) // size(w, h);
  textAlign(CENTER, CENTER)

  // create the timeline
  window.timeline = new Timeline(this, 0.33)

  // create the letters
  const ls = available_letters.split(" ")
  ls.forEach(l => {
    letters.push(new Letter(this, l))
  })

  frameRate(framerate) //  24 frames per second
  background(bgColorStandard[0], bgColorStandard[1], bgColorStandard[2])
}

function draw() {
  const timeline = window.timeline

  background(bgColorStandard[0], bgColorStandard[1], bgColorStandard[2])
  window.timeline.resize()
  timeline.draw()
  timeline.play()
  letters.forEach(letter => {
    // console.log(letter)
    letter.draw()
  })
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
  window.letters.forEach(letter => {
    letter.reposition()
  })
}

function mouseMoved() {
  let keepLooping = true
  let setSpecialCursor = false
  letters.forEach(letter => {
    if (!keepLooping) return

    if (letter.isDragging()) {
      // console.log(`dragging ${letter.text}`);
      cursor("move")
      setSpecialCursor = true
      letter.move(mouseX, mouseY)
      keepLooping = false // breakish out of the loopish thing
    } else if (letter.isCollision(mouseX, mouseY)) {
      // hover effect
      // console.log(`hovering ${letter.text}`);
      cursor("pointer")
      setSpecialCursor = true
      letter.hover(true)
      keepLooping = false // breakish out of the loopish thing
    } else {
      // cursor('default')
      letter.hover(false)
    }
  })
  if (!setSpecialCursor) {
    cursor("default")
  }
}

function mousePressed() {}

function mouseReleased() {
  //ArrayList<Letter> letters = timeline.sortedLetters(timeline.letters);
  //for (let i=0; i<letters.length; i++) {
  //  console.log(letters[i].text + " - " + letters[i].soundFile.duration());
  //}
}

function mouseClicked() {
  let letterClicked = false // whether a letter was clicked
  let keepLooping = true

  // loop through all letters
  letters.forEach(letter => {
    if (!keepLooping) return // a cheap way to pseudo-break the loopish thing

    if (letter.isDragging()) {
      // this letter was previously clicked to pick up and now being clicked to put down
      letterClicked = true
      // add to timeline, if it is dragged over the timeline and not already officially there
      if (!letter.inTimeline && timeline.contains(letter)) {
        // console.log("adding " + letter.text);
        letter.addToTimeline()
        //letter.play();
      }
      // end dragging
      letter.release() // stop dragging;
      keepLooping = false // break the loopish thing
      return false
    }
    if (letter.isCollision(mouseX, mouseY)) {
      // letter is being clicked on for the first time
      letter.bringToFront()
      letterClicked = true
      // remove from timeline, if present
      if (letter.inTimeline) {
        // console.log("removing " + letter.text);
        letter.removeFromTimeline()
      }
      // start dragging
      letter.drag() // start dragging;
      letter.play()
      keepLooping = false // break the loopish thing
      return false // break the loopish thing
    }
  })

  if (!letterClicked) {
    // handle clicks on the timeline
    if (timeline.isCollision(mouseX, mouseY)) {
      timeline.showTimelineLetters()
      timeline.start() // start playing
    }
  }
}

function keyReleased() {}

function keyPressed() {
  if (keyCode == SPACE_KEY) {
    // play timeline
    timeline.showTimelineLetters()
    timeline.start()
  }
}

class Letter {
  constructor(app, text) {
    this.app = app
    this.text = text
    this.soundFile = loadSound(`./data/${text}1.mp3`)
    this.fgColor = window.fgColorFailure //r, g, b
    this.bgColor = window.bgColorFailure //r, g, b
    this.shape = [LETTER_SIZE, LETTER_SIZE] // width, height
    this.dragging = false
    this.inTimeline = false
    this.position = []
    // random start position
    const xPos =
      parseFloat(
        Math.random() * window.windowWidth -
          window.MARGIN * 2 -
          window.LETTER_SIZE * 2
      ) +
      window.MARGIN * 2 +
      window.LETTER_SIZE * 2
    const yPos =
      parseFloat(
        (Math.random() * window.windowHeight * 1) / 2 - window.MARGIN * 2
      ) +
      window.MARGIN * 2
    this.move(xPos, yPos)
  }

  isCollision(xCoord, yCoord) {
    const xOverlap =
      xCoord >= this.position[0] && xCoord <= this.position[0] + this.shape[0]
    const yOverlap =
      yCoord >= this.position[1] && yCoord <= this.position[1] + this.shape[1]
    return xOverlap && yOverlap
  }

  hover(active) {
    // if (active) this.bringToFront()
    this.bgColor = active ? window.fgColorInfo : window.bgColorFailure
  }

  draw() {
    //console.log("drawing " + this.text + " with dragging=" + this.dragging);
    fill(this.bgColor[0], this.bgColor[1], this.bgColor[2])
    window.rect(
      this.position[0],
      this.position[1],
      this.shape[0],
      this.shape[1]
    )
    textAlign(CENTER, CENTER)
    fill(this.fgColor[0], this.fgColor[1], this.fgColor[2])
    window.text(
      this.text,
      this.position[0] + this.shape[0] / 2,
      this.position[1] + this.shape[1] / 2
    )
  }

  move(xCoord, yCoord) {
    // keep in bounds
    xCoord = xCoord < MARGIN ? MARGIN : xCoord
    xCoord = xCoord > windowWidth - MARGIN ? windowWidth - MARGIN : xCoord
    yCoord = yCoord < MARGIN ? MARGIN : yCoord
    yCoord = yCoord > windowHeight - MARGIN ? windowHeight - MARGIN : yCoord
    //console.log("moving " + this.text);
    this.position[0] = xCoord - this.shape[0] / 2
    this.position[1] = yCoord - this.shape[1] / 2
    this.xFactor = xCoord / windowWidth // position as fraction of full width
    this.yFactor = yCoord / windowHeight // position as fraction of full height
  }

  reposition() {
    // console.log(`reposition by factors ${this.xFactor}, ${this.yFactor}`)
    this.move(this.xFactor * windowWidth, this.yFactor * windowHeight)
  }

  bringToFront() {
    const thisLetter = this
    // remove this Letter from original array
    window.letters = window.letters.filter((el, i, arr) => {
      return el != thisLetter
    })
    window.letters.push(this) // add to end of arrray
  }

  stop() {
    this.bgColor = window.bgColorFailure
  }

  play() {
    try {
      this.soundFile.play()
      this.bgColor = window.bgColorSuccess
    } catch (e) {
      console.log(`oops... can't play audio file!`)
    }
  }

  addToTimeline() {
    let timeline = window.timeline
    this.inTimeline = true
    timeline.letters.push(this)
    timeline.sort()
    timeline.showTimelineLetters()
  }

  removeFromTimeline() {
    let timeline = window.timeline
    this.inTimeline = false
    const thisLetter = this
    // remove this Letter from timeline
    timeline.letters = timeline.letters.filter((element, index, array) => {
      return element != thisLetter
    })

    timeline.sort()

    timeline.showTimelineLetters()
  }

  inBounds() {
    let inBounds = true
    if (
      this.position[0] <= 0 ||
      this.position[1] <= 0 ||
      this.position[0] >= this.window.windowWidth ||
      this.position[1] >= this.window.windowHeight
    ) {
      inBounds = false
    }
    return inBounds
  }

  isDragging() {
    return this.dragging
  }
  drag() {
    this.dragging = true
    this.fgColor = window.fgColorInfo
    this.bgColor = window.bgColorInfo
  }
  release() {
    this.dragging = false
    this.fgColor = window.fgColorFailure
    this.bgColor = window.bgColorFailure
  }
}

class Timeline {
  constructor(app, yFactor) {
    this.app = app
    this.text = null
    this.fgColor = window.fgColorInvert
    this.bgColor = window.bgColorInvert
    this.yFactor = yFactor // proportion of window height to consume
    this.resize()
    this.letters = []
    this.playing = false
    this.currentLetterIndex = 0
    this.frameCounter = 0
  }

  isCollision(xCoord, yCoord) {
    const xOverlap =
      xCoord >= this.position[0] && xCoord <= this.position[0] + this.shape[0]
    const yOverlap =
      yCoord >= this.position[1] && yCoord <= this.position[1] + this.shape[1]
    return xOverlap && yOverlap
  }

  resize() {
    //fit timeline within window size
    this.shape = [
      windowWidth - MARGIN * 2,
      this.yFactor * windowHeight - MARGIN,
    ]

    // keep larger than letters
    const minHeight = LETTER_SIZE * 2
    this.shape[1] = this.shape[1] < minHeight ? minHeight : this.shape[1]

    // position at bottom
    this.position = [MARGIN, windowHeight - this.shape[1] - MARGIN]
  }

  draw() {
    fill(this.bgColor[0], this.bgColor[1], this.bgColor[2])
    window.rect(
      this.position[0],
      this.position[1],
      this.shape[0],
      this.shape[1]
    )
    window.textAlign(LEFT, CENTER)
    window.text(
      "Click letters to place them within the white box and then press the SPACE key to speak them.",
      this.position[0],
      this.position[1] - 15
    )
  }

  sort() {
    this.letters = this.sortedLetters(this.letters)
  }

  getDuration() {
    // get the total duration of tracks in the timeline
    let duration = 0
    for (let i = 0; i < this.letters.length; i++) {
      duration += this.letters[i].soundFile.duration()
    }
    return duration
  }

  start() {
    if (this.letters.length <= 0) return

    // start playing
    this.playing = true
    this.frameCounter = 0
    this.currentLetterIndex = 0
    let currentLetter = this.letters[this.currentLetterIndex]
    currentLetter.play()
  }
  stop() {
    this.playing = false
  }
  play() {
    if (this.playing && this.letters.length > 0) {
      let time = this.frameCounter / window.framerate // how long we've been playing a track
      let currentLetter = this.letters[this.currentLetterIndex]
      if (time >= currentLetter.soundFile.duration() * window.OVERLAP_FACTOR) {
        // we're finished with the current track... move on
        currentLetter.stop()
        this.currentLetterIndex++
        this.frameCounter = 0 // reset frame counter
        if (this.currentLetterIndex < this.letters.length) {
          this.letters[this.currentLetterIndex].play()
        } else {
          // we've reached the end
          this.stop()
        }
      }
      this.frameCounter++
    }
  }

  showTimelineLetters() {
    // print out the letters in the timeline;
    let containsLetters = ""
    this.letters.forEach(letter => {
      containsLetters += letter.text + " "
    })
    console.log("The timeline contains: " + containsLetters)
  }

  contains(letter) {
    // determine whether a given letter is within the bounds of this timeline box
    let inBounds = true
    let tl = this.position[0]
    let tr = this.position[0] + this.shape[0]
    let tt = this.position[1]
    let tb = this.position[1] + this.shape[1]
    let ll = parseInt(letter.position[0])
    let lr = parseInt(letter.position[1] + letter.shape[1])
    let lt = parseInt(letter.position[1])
    let lb = parseInt(letter.position[1] + letter.shape[1])
    if (lr <= tl || lb <= tt || ll >= tr || lt >= tb) {
      inBounds = false
    }
    return inBounds
  }

  sortedLetters(letters) {
    let sorted = []
    if (letters.length <= 1) return letters

    let first = letters[0] // assume first letter is left-most

    // find the true left-most letter
    letters.forEach(letter => {
      if (letter.position[0] < first.position[0]) {
        first = letter // store the left-most letter
      }
    })

    sorted.push(first) // add to sorted list
    // remove this Letter from original list
    letters = letters.filter((el, i, arr) => {
      return el != first
    })
    letters = this.sortedLetters(letters)
    letters.forEach(letter => {
      sorted.push(letter)
    })
    return sorted
  }
}
