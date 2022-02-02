import processing.sound.*;
import java.util.ArrayList;

int w = 800;
int h = 600;
int framerate = 24;

final double OVERLAP_FACTOR = 0.8;
final int LETTER_SIZE = 50;
final int MARGIN = 50;

PFont f;
float[] speed = {1.5, -1.5};
int[] bgColorStandard = {0, 0, 0};
int[] fgColorStandard = {255, 255, 255};
int[] bgColorInvert = {255, 255, 255};
int[] fgColorInvert = {0, 0, 0};
int[] bgColorSuccess = {0, 255, 0};
int[] fgColorSuccess = {0, 0, 0};
int[] bgColorFailure = {255, 125, 125};
int[] fgColorFailure = {0, 0, 0};
int[] bgColorInfo = {0, 0, 255};
int[] fgColorInfo = {255, 255, 255};

final int SPACE_KEY = 32;
final int ENTER_KEY = 10;
final int RIGHT_ARROW_KEY = 39;
final int LEFT_ARROW_KEY = 37;
final int UP_ARROW_KEY = 38;
final int DOWN_ARROW_KEY = 40;

Timeline timeline;
ArrayList<Letter> letters;

void settings() {
  size(w, h);
}

void setup() {
  // Create the font
  // printArray(PFont.list());
  // f = createFont("SourceCodePro-Regular.ttf", 24);
  // textFont(f);
  textAlign(CENTER, CENTER);

  // create the timeline
  timeline = new Timeline(this, (int) height/3);
  
  // create the letters
  letters = new ArrayList<Letter>();
  String ls1 = "A B D E I K L M N O P S T V Y SH CH TH A B D E I K L M N O P S T V Y SH CH TH"; // A B C D E F G H I J K L M N O P Q R S T U V W X Y Z";
  String[] ls2 = ls1.split(" ");
  for (String l : ls2) {
    letters.add(new Letter(this, l));
  }

  frameRate(framerate); //  24 frames per second
  background(bgColorStandard[0], bgColorStandard[1], bgColorStandard[2]);
  
}

void draw() {
  background(bgColorStandard[0], bgColorStandard[1], bgColorStandard[2]);
  timeline.draw();
  timeline.play();
  for (int i=0; i<letters.size(); i++) {
    letters.get(i).draw();
  }
}

void mouseMoved() {
  for (int i=0; i<letters.size(); i++) {
    Letter letter = letters.get(i);
    if (letter.isDragging()) {
      //System.out.println("dragging " + letter.text);
      letter.move(mouseX, mouseY);
    }
  }
}

void mousePressed() {
}

void mouseReleased() {
  //ArrayList<Letter> letters = timeline.sortedLetters(timeline.letters);
  //for (int i=0; i<letters.size(); i++) {
  //  System.out.println(letters.get(i).text + " - " + letters.get(i).soundFile.duration());
  //}
}

void mouseClicked() {
  boolean letterClicked = false; // whether a letter was clicked
  for (int i=0; i<letters.size(); i++) {
    Letter letter = letters.get(i);
    if (letter.isDragging()) {
      letterClicked = true;
      // add to timeline, if present
      if (!letter.inTimeline && timeline.contains(letter)) {
        //System.out.println("adding " + letter.text);
        letter.addToTimeline();
        //letter.play();
      }
      // end dragging
      letter.release(); // stop dragging;
      break;
    }
    if (letter.isHover()) {
      letterClicked = true;
      // remove from timeline, if present
      if (letter.inTimeline) {
        System.out.println("removing " + letter.text);
        letter.removeFromTimeline();
      }
      // start dragging
      letter.drag(); // start dragging;
      letter.play();
      break;
    }
  } // for
  
  if (!letterClicked) {
    // handle clicks on the timeline
    if (mouseX >= this.timeline.position[0] && mouseX <= this.timeline.position[0] + this.timeline.shape[0] && 
      mouseY >= this.timeline.position[1] && mouseY <= this.timeline.position[1] + this.timeline.shape[1]) {
        this.timeline.showTimelineLetters();
        this.timeline.start();
      }
  }
}

void keyReleased() {
}

void keyPressed() {
}


class Letter {
  
  Letter(phonetics app, String text) {
    this.app = app;
    this.text = text;
    this.soundFile = new SoundFile(app, text + "1.aiff");
    this.fgColor = app.fgColorFailure; //r, g, b
    this.bgColor = app.bgColorFailure; //r, g, b
    this.position[0] = (float) (Math.random() * app.width - app.MARGIN*2 - app.LETTER_SIZE*2) + app.MARGIN*2 + app.LETTER_SIZE*2;
    this.position[1] = (float) (Math.random() * app.height*1/2 - app.MARGIN*2) + app.MARGIN*2;
    this.shape[0] = app.LETTER_SIZE; // width
    this.shape[1] = app.LETTER_SIZE; // height
  }
  
  void draw() {
    //System.out.println("drawing " + this.text + " with dragging=" + this.dragging);
    fill(this.bgColor[0], this.bgColor[1], this.bgColor[2]);
    this.app.rect(this.position[0], this.position[1], this.shape[0], this.shape[1]);
    textAlign(CENTER, CENTER);
    fill(this.fgColor[0], this.fgColor[1], this.fgColor[2]);
    this.app.text(this.text,  this.position[0]+this.shape[0]/2, this.position[1]+this.shape[1]/2);
  }
  
  void move(int mouseX, int mouseY) {
    //System.out.println("moving " + this.text);
    this.position[0] = mouseX - this.shape[0]/2;
    this.position[1] = mouseY - this.shape[1]/2;
  }
  
  void stop() {
    this.bgColor = app.bgColorFailure;
  }
  
  void play() {
    this.soundFile.play();
    this.bgColor = app.bgColorSuccess;
  }
  
  void addToTimeline() {
    this.inTimeline = true;
    this.app.timeline.letters.add(this);
    this.app.timeline.sort();
    
    this.app.timeline.showTimelineLetters();
  }
  
  void removeFromTimeline() {
    this.inTimeline = false;
    this.app.timeline.letters.remove(this);
    this.app.timeline.sort();
    
    this.app.timeline.showTimelineLetters();
  }
  
  boolean inBounds() {
    boolean inBounds = true;
    if (this.position[0] <= 0 || this.position[1] <= 0 || this.position[0] >= this.app.width || this.position[1] >= this.app.height) {
      inBounds = false;
    }
    return inBounds;
  }

  boolean isHover() {
    return (app.mouseX >= this.position[0] && app.mouseX <= this.position[0] + this.shape[0] && 
      app.mouseY >= this.position[1] && app.mouseY <= this.position[1] + this.shape[1]);
  }
  
  boolean isDragging() {
    return this.dragging;
  }
  void drag() {
    this.dragging = true;
    this.fgColor = app.fgColorInfo;
    this.bgColor = app.bgColorInfo;
  }
  void release() {
    this.dragging = false;
    this.fgColor = app.fgColorFailure;
    this.bgColor = app.bgColorFailure;
  }
  
  phonetics app;
  String text;
  SoundFile soundFile;
  float[] position = new float[2]; // x, y
  int[] shape = new int[2]; // width, height
  int[] fgColor = new int[3]; // r, g, b
  int[] bgColor = new int[3]; // r, g, b
  boolean dragging = false;
  boolean inTimeline = false;
}

class Timeline {
  
  Timeline(phonetics app, int height) {
    this.app = app;
    this.fgColor = fgColorInvert;
    this.bgColor = bgColorInvert;
    this.position[0] = app.MARGIN;
    this.position[1] = app.height - height - app.MARGIN;
    this.shape[0] = app.width - app.MARGIN*2;
    this.shape[1] = height;
    this.letters = new ArrayList<Letter>();
  }

  void draw() {
    fill(this.bgColor[0], this.bgColor[1], this.bgColor[2]);
    this.app.rect(this.position[0], this.position[1], this.shape[0], this.shape[1]);
    app.textAlign(LEFT, CENTER);
    this.app.text("Click to pick up letters and place them in box. Click box to play.", this.position[0], this.position[1] - 15);
  }
  
  void sort() {
    this.letters = this.sortedLetters(this.letters);
  }
  
  double getDuration() {
    // get the total duration of tracks in the timeline
    double duration = 0;
    for (int i=0; i<this.letters.size(); i++) {
      duration += this.letters.get(i).soundFile.duration();
    }
    return duration;
  }
  
  void start() {
    if (this.letters.size() <= 0) return;
    
    // start playing
    this.playing = true;
    this.frameCounter = 0;
    this.currentLetterIndex = 0;
    Letter currentLetter = this.letters.get(this.currentLetterIndex);
    currentLetter.play();
  }
  void stop() {
    this.playing = false;
  }
  void play() {
    if (this.playing && this.letters.size() > 0) {
      double time = frameCounter / frameRate; // how long we've been playing a track
      Letter currentLetter = this.letters.get(this.currentLetterIndex);
      if (time >= currentLetter.soundFile.duration() * app.OVERLAP_FACTOR) {
        // we're finished with the current track... move on
        currentLetter.stop();
        currentLetterIndex++;
        frameCounter = 0; // reset frame counter
        if (this.currentLetterIndex < this.letters.size()) {
          this.letters.get(this.currentLetterIndex).play();
        }
        else {
          // we've reached the end
          this.stop();
        }
      }
      this.frameCounter++;
    }
  }

  void showTimelineLetters() {
    // print out the letters in the timeline;
    String containsLetters = "";
    for (int i = 0; i<letters.size(); i++) {
      containsLetters += letters.get(i).text + " ";
    }
    System.out.println("The timeline contains: " + containsLetters); 
  }
  
  boolean contains(Letter letter) {
    // determine whether a given letter is within the bounds of this timeline box
    boolean inBounds = true;
    int tl = this.position[0];
    int tr = this.position[0] + this.shape[0];
    int tt = this.position[1];
    int tb = this.position[1] + this.shape[1];
    int ll = (int) letter.position[0];
    int lr = (int) letter.position[1] + letter.shape[1];
    int lt = (int) letter.position[1];
    int lb = (int) letter.position[1] + letter.shape[1];
    if (lr <= tl || lb <= tt || ll >= tr || lt >= tb) {
      inBounds = false;
    }
    return inBounds;
  }
  
  ArrayList<Letter> sortedLetters(ArrayList<Letter> letters) {
    ArrayList<Letter> sorted = new ArrayList<Letter>();
    if (letters.size() <= 1) return letters;
    Letter first = letters.get(0); // assume first letter is left-most
    // find the true left-most letter
    for (int i=0; i<letters.size(); i++) {
      if (letters.get(i).position[0] < first.position[0]) {
        first = letters.get(i); // store the left-most letter
      }
    }
    letters.remove(first); // pop the left-most letter off the list
    sorted.add(first);
    letters = sortedLetters(letters);
    for (int i=0; i<letters.size(); i++) {
      sorted.add(letters.get(i));
    }
    return sorted;
  }
  
  phonetics app;
  String text;
  int[] fgColor = new int[3];
  int[] bgColor = new int[3];
  int[] position = new int[2];
  int[] shape = new int[2];
  ArrayList<Letter> letters;
  // vars used for playing the letters in the timeline
  boolean playing = false;
  int currentLetterIndex = 0;
  int frameCounter = 0;
}
