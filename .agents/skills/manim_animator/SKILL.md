---
name: manim_animator
description: Create 2D and 3D mathematical and technical animation videos using Manim (Community Edition) to visualize algorithms, data structures, system architectures, software engineering concepts, and math proofs.
---

When the user asks to create an animation video, visualize a concept programmatically, generate a Manim visual, or run `/manim` / `/animate`, apply this skill. Follow these step-by-step instructions:

---

### 1. Device Inspection & Setup (Multi-Runtime Engine)

The skill features a **Multi-Runtime Device Inspector** (`Bash`, `Python`, `Node.js`, `Docker`).

On the first run, execute the Node.js device inspector from the workspace root:
```bash
node .agents/skills/manim_animator/scripts/setup.js
```

#### How Mode Selection Works:
The setup script probes your device capabilities and auto-selects the **optimal rendering engine**:
- 🚀 **Docker Mode (Recommended)**: Selected automatically if Docker daemon is active. Uses `manimcommunity/manim` container without needing local C/C++ libraries (`ffmpeg`, `cairo`, `pango`, `texlive`).
- 🐍 **Native Python Mode**: Used if Python `venv` and system libraries are installed locally.
- 🟢 **Node.js Hybrid Engine**: If Node.js is present, Node scripts (`node .agents/skills/manim_animator/scripts/render.js`) trigger 720p frame renders across any backend seamlessly.

---

### 2. Workflow for Generating Animations

1. **Understand the Target Concept**: Identify key elements to explain (e.g., Sorting Algorithm, Binary Search Tree insertion, Microservice request flow, Mathematical theorem).
2. **Design the Visual Storyboard**: Map entities to Manim Mobjects (`Text`, `MathTex`, `Square`, `Circle`, `Arrow`, `VGroup`).
3. **Write the Python Script**: Create a `.py` file inside an appropriate folder (e.g., `animations/<topic>/visual.py`).
4. **Render the Scene in 720p Resolution**:
   - **Using Node Universal Engine (Defaults to 720p / `-qm`)**:
     ```bash
     node .agents/skills/manim_animator/scripts/render.js animations/<topic>/visual.py MainScene
     ```
   - **Using Docker Direct (720p Quality)**:
     ```bash
     docker run --rm -v "$PWD":/manim manimcommunity/manim manim -qm animations/<topic>/visual.py MainScene
     ```
   - **Using Python Venv Direct (720p Quality)**:
     ```bash
     source .agents/skills/manim_animator/.venv/bin/activate
     manim -qm animations/<topic>/visual.py MainScene
     ```
5. **Present the Result**: Provide the path to the generated 720p frame directory and web player at `http://localhost:3000`.

---

### 3. Reusable Code Templates

#### A. Mathematical & Text Animation Template
```python
from manim import *

class MathExplanationScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f172a"
        title = Text("Euler's Identity", font_size=40, color=BLUE, font="Poppins")
        formula = MathTex(r"e^{i\pi} + 1 = 0", font_size=60)
        
        self.play(Write(title))
        self.wait(1)
        self.play(title.animate.to_edge(UP))
        
        self.play(FadeIn(formula, shift=DOWN))
        self.wait(1)
        
        # Highlight e^{i\pi}
        frame_box = SurroundingRectangle(formula[0][:4], buff=0.1, color=YELLOW)
        self.play(Create(frame_box))
        self.wait(2)
```

#### B. Data Structure / Array Animation Template
```python
from manim import *

class ArraySortingScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f172a"
        numbers = [4, 2, 7, 1]
        squares = VGroup(*[
            Square(side_length=1.2, fill_opacity=0.2, fill_color=TEAL, stroke_color=WHITE)
            for _ in numbers
        ]).arrange(RIGHT, buff=0.2)
        
        labels = VGroup(*[
            Text(str(num), font_size=32, font="Poppins").move_to(sq.get_center())
            for num, sq in zip(numbers, squares)
        ])
        
        array_group = VGroup(squares, labels).move_to(ORIGIN)
        
        self.play(Create(squares), Write(labels))
        self.wait(1)
        
        pointer1 = Arrow(start=DOWN*1.5, end=squares[0].get_bottom(), color=RED)
        pointer2 = Arrow(start=DOWN*1.5, end=squares[1].get_bottom(), color=RED)
        
        self.play(Create(pointer1), Create(pointer2))
        self.wait(1)
```

#### C. System Architecture Flow Animation Template
```python
from manim import *

class SystemFlowScene(Scene):
    def construct(self):
        self.camera.background_color = "#0f172a"
        client = Rectangle(height=1.5, width=2.0, fill_color=BLUE, fill_opacity=0.3).shift(LEFT * 4)
        client_text = Text("Client", font_size=24, font="Poppins").move_to(client.get_center())
        
        server = Rectangle(height=1.5, width=2.0, fill_color=GREEN, fill_opacity=0.3).shift(RIGHT * 4)
        server_text = Text("API Server", font_size=24, font="Poppins").move_to(server.get_center())
        
        request_line = Arrow(client.get_right(), server.get_left(), buff=0.1, color=YELLOW)
        packet = Dot(color=ORANGE, radius=0.15).move_to(client.get_right())
        
        self.play(Create(client), Write(client_text), Create(server), Write(server_text))
        self.play(Create(request_line))
        self.play(MoveAlongPath(packet, request_line), run_time=2)
        self.wait(1)
```

---

### 4. Universal Web Frame Player Architecture
To bypass video codec and black screen playback issues entirely, animations are exported as 720p high-resolution PNG image frame sequences (`frame_0000.png` ... `frame_XXXX.png`) stored in organized topic folders (`animations/<topic>/frames/`).

* **Web Player Application**: Stored at `player/index.html`. It preloads PNG frames into memory and renders them smoothly on an HTML5 `<canvas>` at configurable speeds (0.5x to 2.0x).
* **Manifest Management**: Rendering via `node .agents/skills/manim_animator/scripts/render.js` automatically organizes output PNG frames into `animations/<topic>/frames/` and updates `animations/manifest.json`.

---

### 5. Best Practices
* **Resolution**: Default to 720p (`-qm` flag / `1280x720` resolution at 30 FPS).
* **Typography**: Always use `font="Poppins"` when creating `Text(...)` elements across all scenes. The TTF font file is stored in the repository at `.agents/skills/manim_animator/assets/fonts/Poppins-Regular.ttf`.
* **Background Styling**: Set `self.camera.background_color = "#0f172a"` (or solid `BLACK`) in the `construct()` method of scenes.
* **Pacing**: Use `self.wait(1)` to `self.wait(2)` between major visual shifts so the viewer can process changes.
* **Colors**: Stick to high-contrast palettes (`BLUE`, `TEAL`, `GREEN`, `YELLOW`, `RED`, `WHITE`).
