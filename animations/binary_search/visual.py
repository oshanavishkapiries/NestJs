from manim import *

class BinarySearchScene(Scene):
    def construct(self):
        # Explicit solid background to avoid alpha channel / black video issues
        self.camera.background_color = "#0f172a" # Modern dark slate background
        
        font_family = "Poppins"

        # 1. Title & Header
        title = Text("Binary Search Algorithm", font_size=40, color=BLUE, font=font_family).to_edge(UP, buff=0.4)
        target_val = 23
        target_text = Text(f"Target: {target_val}", font_size=28, color=YELLOW, font=font_family).next_to(title, DOWN, buff=0.2)
        
        self.play(Write(title), Write(target_text))
        self.wait(1)

        # 2. Data & Array Setup
        arr_data = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
        n = len(arr_data)
        
        boxes = VGroup()
        val_texts = VGroup()
        idx_texts = VGroup()
        
        box_size = 1.0
        spacing = 0.15
        
        for i, val in enumerate(arr_data):
            box = Square(side_length=box_size, fill_opacity=0.3, fill_color=TEAL, stroke_color=WHITE)
            val_txt = Text(str(val), font_size=26, font=font_family)
            idx_txt = Text(str(i), font_size=18, color=GRAY, font=font_family)
            
            val_txt.move_to(box.get_center())
            
            boxes.add(box)
            val_texts.add(val_txt)
            idx_texts.add(idx_txt)

        array_group = VGroup(*[VGroup(boxes[i], val_texts[i]) for i in range(n)])
        array_group.arrange(RIGHT, buff=spacing).move_to(UP * 0.5)

        for i in range(n):
            idx_texts[i].next_to(boxes[i], UP, buff=0.15)

        self.play(
            LaggedStart(*[Create(boxes[i]) for i in range(n)], lag_ratio=0.08),
            LaggedStart(*[Write(val_texts[i]) for i in range(n)], lag_ratio=0.08),
            LaggedStart(*[Write(idx_texts[i]) for i in range(n)], lag_ratio=0.08)
        )
        self.wait(1)

        # 3. Pointers Setup (Low, High, Mid)
        low_ptr = VGroup(
            Arrow(start=DOWN * 1.2, end=DOWN * 0.1, color=BLUE, buff=0),
            Text("L", font_size=22, color=BLUE, weight=BOLD, font=font_family)
        )
        low_ptr[1].next_to(low_ptr[0], DOWN, buff=0.08)

        high_ptr = VGroup(
            Arrow(start=DOWN * 1.2, end=DOWN * 0.1, color=RED, buff=0),
            Text("H", font_size=22, color=RED, weight=BOLD, font=font_family)
        )
        high_ptr[1].next_to(high_ptr[0], DOWN, buff=0.08)

        mid_ptr = VGroup(
            Arrow(start=UP * 1.2, end=UP * 0.1, color=YELLOW, buff=0),
            Text("M", font_size=22, color=YELLOW, weight=BOLD, font=font_family)
        )
        mid_ptr[1].next_to(mid_ptr[0], UP, buff=0.08)

        # Explanation box at the bottom
        status_bg = Rectangle(width=11, height=1.1, fill_color=BLACK, fill_opacity=0.85, stroke_color=DARK_GRAY)
        status_bg.to_edge(DOWN, buff=0.3)
        status_text = Text("Initialize Low = 0, High = 9", font_size=22, color=WHITE, font=font_family).move_to(status_bg.get_center())
        
        self.play(Create(status_bg), Write(status_text))
        
        # Position initial low and high pointers
        low = 0
        high = n - 1
        
        low_ptr.next_to(boxes[low], DOWN, buff=0.1)
        high_ptr.next_to(boxes[high], DOWN, buff=0.1)
        
        self.play(Create(low_ptr), Create(high_ptr))
        self.wait(1)

        # Step helper loop
        steps_info = [
            # Step 1: L=0, H=9 -> M=4 (val 16 < 23) -> move L=5
            (0, 9, 4, "16 < 23", "16 < 23 → Target is larger! Eliminate left half (0..4).", 5, 9),
            # Step 2: L=5, H=9 -> M=7 (val 56 > 23) -> move H=6
            (5, 9, 7, "56 > 23", "56 > 23 → Target is smaller! Eliminate right half (7..9).", 5, 6),
            # Step 3: L=5, H=6 -> M=5 (val 23 == 23) -> Found!
            (5, 6, 5, "23 == 23", "23 == 23 → Target found at index 5!", 5, 6)
        ]

        mid_active = False

        for step_idx, (curr_l, curr_h, curr_m, comp_str, action_str, next_l, next_h) in enumerate(steps_info):
            # Calculate mid text
            calc_str = f"Step {step_idx + 1}: Low = {curr_l}, High = {curr_h}  ⇒  Mid = ({curr_l} + {curr_h}) // 2 = {curr_m}"
            new_status = Text(calc_str, font_size=20, color=YELLOW, font=font_family).move_to(status_bg.get_center())
            self.play(Transform(status_text, new_status))
            
            mid_ptr.next_to(boxes[curr_m], UP, buff=0.45)
            
            if not mid_active:
                self.play(Create(mid_ptr))
                mid_active = True
            else:
                self.play(mid_ptr.animate.next_to(boxes[curr_m], UP, buff=0.45))
            
            # Highlight mid box
            self.play(boxes[curr_m].animate.set_fill(YELLOW, opacity=0.5), run_time=0.5)
            self.wait(1)

            # Compare step
            comp_text = Text(f"Check Array[Mid] = {arr_data[curr_m]} vs Target {target_val}  ({comp_str})", font_size=20, color=WHITE, font=font_family).move_to(status_bg.get_center())
            self.play(Transform(status_text, comp_text))
            self.wait(1)

            if step_idx < len(steps_info) - 1:
                # Action text
                act_text = Text(action_str, font_size=20, color=LIGHT_GRAY, font=font_family).move_to(status_bg.get_center())
                self.play(Transform(status_text, act_text))

                # Eliminate out-of-bounds elements
                if next_l > curr_l: # Eliminated left
                    elim_boxes = [boxes[i] for i in range(curr_l, next_l)]
                    elim_texts = [val_texts[i] for i in range(curr_l, next_l)]
                    self.play(
                        *[b.animate.set_fill(DARK_GRAY, opacity=0.3).set_stroke(GRAY) for b in elim_boxes],
                        *[t.animate.set_color(DARK_GRAY) for t in elim_texts],
                        low_ptr.animate.next_to(boxes[next_l], DOWN, buff=0.1)
                    )
                elif next_h < curr_h: # Eliminated right
                    elim_boxes = [boxes[i] for i in range(next_h + 1, curr_h + 1)]
                    elim_texts = [val_texts[i] for i in range(next_h + 1, curr_h + 1)]
                    self.play(
                        *[b.animate.set_fill(DARK_GRAY, opacity=0.3).set_stroke(GRAY) for b in elim_boxes],
                        *[t.animate.set_color(DARK_GRAY) for t in elim_texts],
                        high_ptr.animate.next_to(boxes[next_h], DOWN, buff=0.1)
                    )
                
                # Reset mid box fill color if not eliminated
                if curr_m >= next_l and curr_m <= next_h:
                    self.play(boxes[curr_m].animate.set_fill(TEAL, opacity=0.3), run_time=0.3)
                self.wait(1)
            else:
                # Success!
                found_text = Text("✨ Target 23 found at index 5! ✨", font_size=22, color=GREEN, weight=BOLD, font=font_family).move_to(status_bg.get_center())
                self.play(
                    Transform(status_text, found_text),
                    boxes[curr_m].animate.set_fill(GREEN, opacity=0.7).set_stroke(GREEN, width=4),
                    val_texts[curr_m].animate.set_color(WHITE)
                )
                self.play(Indicate(boxes[curr_m], color=GREEN, scale_factor=1.2))
                self.wait(2)

        # 4. Complexity & Summary
        self.play(
            FadeOut(low_ptr), FadeOut(high_ptr), FadeOut(mid_ptr),
            FadeOut(status_bg), FadeOut(status_text), FadeOut(array_group), FadeOut(idx_texts), FadeOut(target_text), FadeOut(title)
        )
        
        summary_title = Text("Binary Search Key Takeaways", font_size=36, color=BLUE, font=font_family).to_edge(UP, buff=0.8)
        
        bullets = VGroup(
            Text("• Requires a SORTED array", font_size=24, color=WHITE, font=font_family),
            Text("• Halves search space each step", font_size=24, color=WHITE, font=font_family),
            Text("• Time Complexity: O(log N)", font_size=24, color=YELLOW, font=font_family),
            Text("• Space Complexity: O(1)", font_size=24, color=GREEN, font=font_family)
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.4).move_to(ORIGIN)
        
        self.play(Write(summary_title))
        self.play(LaggedStart(*[FadeIn(b, shift=RIGHT) for b in bullets], lag_ratio=0.3))
        self.wait(3)
