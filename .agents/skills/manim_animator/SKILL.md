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
2. **Design the Visual Storyboard**: Map entities to Manim Mobjects (`Text`, `MathTex`, `SVGMobject`, `ImageMobject`, `VGroup`).
3. **Fetch Vector Clipart / SVG Assets from the Internet**:
   - For rich visual illustrations, download vector icons/clipart from the web into `animations/<topic>/assets/`:
     ```bash
     python3 .agents/skills/manim_animator/scripts/fetch_asset.py <icon_or_url> animations/<topic>/assets/<filename>.svg
     ```
   - Load downloaded vector icons in Manim using `SVGMobject("animations/<topic>/assets/<filename>.svg")` or raster images using `ImageMobject(...)`.
4. **Write the Python Script**: Create a `.py` file inside an appropriate folder (e.g., `animations/<topic>/visual.py`).
5. **Render the Scene in 720p Resolution**:
   - **Using Node Universal Engine (Defaults to 720p / `-qm`)**:
     ```bash
     node .agents/skills/manim_animator/scripts/render.js animations/<topic>/visual.py MainScene
     ```
6. **Present the Result**: Provide the path to the generated 720p frame directory and web player at `http://localhost:3000`.

---

### 3. Reusable Code Templates

#### A. Mathematical & Text Animation Template
```python
from manim import *

class MathExplanationScene(Scene):
    def construct(self):
        self.camera.background_color = "#F3F6FA"
        
        # Header banner card
        card = RoundedRectangle(corner_radius=0.15, height=5.0, width=9.0, fill_color="#FFFFFF", fill_opacity=1.0, stroke_color="#CFD8DC", stroke_width=1.5)
        title = Text("Euler's Identity", font="Poppins", weight=BOLD, font_size=36, color="#1A202C").next_to(card.get_top(), DOWN, buff=0.4)
        formula = MathTex(r"e^{i\pi} + 1 = 0", font_size=56, color="#2D3748").move_to(card.get_center())
        
        self.play(FadeIn(card), Write(title))
        self.wait(0.5)
        self.play(FadeIn(formula, shift=UP * 0.2))
        self.wait(1)
        
        # Highlight e^{i\pi} with soft amber rectangle
        frame_box = SurroundingRectangle(formula[0][:4], buff=0.1, color="#F57F17", stroke_width=2.5)
        self.play(Create(frame_box))
        self.wait(2)
```

#### B. Data Structure / Array Animation Template
```python
from manim import *

class ArraySortingScene(Scene):
    def construct(self):
        self.camera.background_color = "#F3F6FA"
        numbers = [4, 2, 7, 1]
        
        container = RoundedRectangle(corner_radius=0.2, height=3.5, width=8.5, fill_color="#FFFFFF", fill_opacity=1.0, stroke_color="#CFD8DC", stroke_width=1.5)
        
        squares = VGroup(*[
            RoundedRectangle(corner_radius=0.1, height=1.2, width=1.2, fill_color="#F8FAFC", fill_opacity=1.0, stroke_color="#37474F", stroke_width=2)
            for _ in numbers
        ]).arrange(RIGHT, buff=0.3).move_to(container.get_center())
        
        labels = VGroup(*[
            Text(str(num), font="Poppins", weight=BOLD, font_size=32, color="#1A202C").move_to(sq.get_center())
            for num, sq in zip(numbers, squares)
        ])
        
        self.play(FadeIn(container), Create(squares), Write(labels))
        self.wait(1)
        
        pointer1 = CurvedArrow(start_point=DOWN*2.0 + LEFT*1.0, end_point=squares[0].get_bottom(), color="#00838F", angle=-0.3)
        pointer2 = CurvedArrow(start_point=DOWN*2.0 + RIGHT*1.0, end_point=squares[1].get_bottom(), color="#F57F17", angle=0.3)
        
        self.play(Create(pointer1), Create(pointer2))
        self.wait(1)
```

#### C. System Architecture Flow Animation Template
```python
from manim import *

class SystemFlowScene(Scene):
    def construct(self):
        self.camera.background_color = "#F3F6FA"
        
        # Client Card Container
        client_card = RoundedRectangle(corner_radius=0.15, height=2.2, width=3.2, fill_color="#FFFFFF", fill_opacity=1.0, stroke_color="#CFD8DC", stroke_width=1.5).shift(LEFT * 3.5)
        client_box = RoundedRectangle(corner_radius=0.1, height=1.2, width=2.4, fill_color="#455A64", fill_opacity=1.0, stroke_color="#263238", stroke_width=1.5).move_to(client_card.get_center())
        client_text = Text("User's Wallet", font="Poppins", weight=BOLD, font_size=18, color="#FFFFFF").move_to(client_box.get_center())
        
        # Server Card Container
        server_card = RoundedRectangle(corner_radius=0.15, height=2.2, width=3.2, fill_color="#FFFFFF", fill_opacity=1.0, stroke_color="#CFD8DC", stroke_width=1.5).shift(RIGHT * 3.5)
        server_box = RoundedRectangle(corner_radius=0.1, height=1.2, width=2.4, fill_color="#2E7D32", fill_opacity=1.0, stroke_color="#1B5E20", stroke_width=1.5).move_to(server_card.get_center())
        server_text = Text("P2P Network", font="Poppins", weight=BOLD, font_size=18, color="#FFFFFF").move_to(server_box.get_center())
        
        # Connection Path & Flow Packet
        request_line = CurvedArrow(client_card.get_right(), server_card.get_left(), color="#00838F", angle=0.1, stroke_width=4)
        packet = Dot(color="#FFB300", radius=0.18).move_to(client_card.get_right())
        
        self.play(FadeIn(client_card), Create(client_box), Write(client_text))
        self.play(FadeIn(server_card), Create(server_box), Write(server_text))
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

### 5. Design System & Visual Style Guidelines (Gemini Notebook / Editorial Vector Illustration Style)

All generated Manim animations MUST strictly follow this design system to match modern, clean editorial infographics (e.g. Gemini Notebook style):

#### A. Color Palette & Background
- **Background Color**: `#F3F6FA` (Light slate/blue-gray tint). Never use plain dark blue (`#0f172a`) or solid black unless explicitly requested.
- **Card Fill / Container Fill**: `#FFFFFF` (Pure White) with subtle dark borders (`stroke_color="#CFD8DC"` or `#B0BEC5`, `stroke_width=1.5`).
- **Primary Accent Colors**:
  - Soft Emerald Green: `#2E7D32` / `#66BB6A` (e.g., success, keys, unspent outputs)
  - Muted Slate / Steel Blue: `#37474F` / `#455A64` (e.g., wallet bodies, hardware boxes, headers)
  - Warm Gold / Amber: `#F57F17` / `#FFB300` (e.g., coins, key accents, highlights)
  - Soft Teal / Cyan: `#00838F` / `#26C6DA` (e.g., network nodes, connection lines)
  - Light Neutral Card Fill: `#F8FAFC`
- **Text & Label Colors**:
  - Main Headlines / Titles: `#1A202C` (Dark charcoal, bold)
  - Subheaders & Section Titles: `#2D3748` (Medium dark)
  - Captions & Descriptive Text: `#4A5568` / `#718096`

#### B. Visual Component Patterns & Layout Structure
1. **Infographic Card Containers**:
   - Wrap visual groups into white rounded containers (`RoundedRectangle(corner_radius=0.2, fill_color="#FFFFFF", fill_opacity=1.0, stroke_color="#CFD8DC", stroke_width=1.5)`).
   - Add small dark title banners or badge pills at the top of cards.
2. **Icons & Diagrammatic Elements**:
   - Build custom vector shapes using nested Manim Mobjects (`VGroup` combining `RoundedRectangle`, `Circle`, `Dot`, `Line`, `CurvedArrow`).
   - Give key interactive elements clean stroke outlines (`stroke_color="#263238"`, `stroke_width=2`).
3. **Connecting Pathways & Flow Lines**:
   - Use smooth curved paths (`CubicBezier`, `CurvedArrow`, or `Elbow` paths) with soft colored gradients or distinct teal/blue stroke paths (`#00838F`).
   - Animate data packet flows using `Dot` or small glowing badges moving along paths (`MoveAlongPath`).
4. **Network & Graph Nodes**:
   - Node clusters (e.g. peer-to-peer network or graph nodes): Use translucent colored circles with dark stroke outlines and intersecting connecting lines (`#00838F` lines, `#66BB6A` nodes).

#### C. Typography & Code Templates

```python
from manim import *

class StyledEditorialScene(Scene):
    def construct(self):
        # 1. Set Light Slate Background
        self.camera.background_color = "#F3F6FA"
        
        # 2. Main Title
        title = Text("Mastering Architecture: Component Lifecycle", font="Poppins", weight=BOLD, font_size=36, color="#1A202C")
        title.to_edge(UP, buff=0.4)
        
        # 3. Card Container
        card = RoundedRectangle(corner_radius=0.2, height=4.5, width=5.5, fill_color="#FFFFFF", fill_opacity=1.0, stroke_color="#CFD8DC", stroke_width=1.5).shift(LEFT * 3)
        card_header = Text("User's Wallet", font="Poppins", weight=BOLD, font_size=20, color="#2D3748").next_to(card.get_top(), DOWN, buff=0.3)
        
        # 4. Custom Icon / Mobject inside Card
        device_box = RoundedRectangle(corner_radius=0.1, height=2.2, width=3.2, fill_color="#455A64", fill_opacity=1.0, stroke_color="#263238", stroke_width=2).move_to(card.get_center())
        screen = Rectangle(height=1.4, width=2.8, fill_color="#F8FAFC", fill_opacity=1.0, stroke_color="#CFD8DC", stroke_width=1).move_to(device_box.get_center())
        
        # 5. Play Animations
        self.play(Write(title))
        self.play(FadeIn(card, shift=UP), Write(card_header))
        self.play(Create(device_box), Create(screen))
        self.wait(2)
```

---

### 6. Best Practices
* **Resolution**: Default to 720p (`-qm` flag / `1280x720` resolution at 30 FPS).
* **Typography**: Always use `font="Sans"` when creating `Text(...)` elements across all scenes to ensure clean, crisp sans-serif letter-spacing and kerning across Docker and native environments.
* **Background Styling**: Always set `self.camera.background_color = "#F3F6FA"` in the `construct()` method of scenes.
* **Pacing**: Use `self.wait(1)` to `self.wait(2)` between major visual shifts so the viewer can process changes.
* **Colors**: Stick to high-contrast, clean editorial palettes (Light Slate background `#F3F6FA`, White cards `#FFFFFF`, Charcoal text `#1A202C`, Emerald `#2E7D32`, Amber `#F57F17`, Cyan `#00838F`).

