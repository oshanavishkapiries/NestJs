from manim import *

class BubbleSortScene(Scene):
    def construct(self):
        # Title
        title = Text("Bubble Sort Algorithm", font_size=40, color=BLUE).to_edge(UP)
        self.play(Write(title))
        self.wait(0.5)

        # Initial Unsorted Array
        array_data = [6, 2, 8, 3, 1]
        bars = VGroup()
        labels = VGroup()
        
        # Create bars and labels
        colors = [BLUE_D, BLUE_C, BLUE_B, TEAL_D, TEAL_C]
        for i, val in enumerate(array_data):
            bar = Rectangle(
                height=val * 0.5, 
                width=0.8, 
                fill_color=colors[i % len(colors)], 
                fill_opacity=0.8, 
                stroke_color=WHITE
            )
            label = Text(str(val), font_size=28, color=WHITE).move_to(bar.get_center())
            group = VGroup(bar, label)
            bars.add(group)
            
        bars.arrange(RIGHT, buff=0.4).shift(DOWN * 0.5)
        
        self.play(Create(bars), run_time=1.5)
        self.wait(1)

        # Status Banner
        status = Text("Comparing adjacent elements...", font_size=24, color=YELLOW).next_to(title, DOWN)
        self.play(FadeIn(status))
        self.wait(0.5)

        # Bubble Sort Logic with Animation
        n = len(bars)
        for i in range(n):
            for j in range(0, n - i - 1):
                # Pointers / Highlight compared bars
                bar_left = bars[j]
                bar_right = bars[j + 1]
                
                # Highlight comparing pair in YELLOW
                orig_color_left = bar_left[0].fill_color
                orig_color_right = bar_right[0].fill_color
                
                self.play(
                    bar_left[0].animate.set_fill(YELLOW, opacity=0.9),
                    bar_right[0].animate.set_fill(YELLOW, opacity=0.9),
                    run_time=0.4
                )
                
                # Check if swap needed
                val_left = int(bar_left[1].text)
                val_right = int(bar_right[1].text)
                
                if val_left > val_right:
                    # Update status
                    swap_text = Text(f"Swap {val_left} and {val_right}", font_size=24, color=RED).next_to(title, DOWN)
                    self.play(Transform(status, swap_text), run_time=0.3)
                    
                    # Animate Swap positions
                    pos_left = bar_left.get_center()
                    pos_right = bar_right.get_center()
                    
                    self.play(
                        bar_left.animate.move_to(pos_right),
                        bar_right.animate.move_to(pos_left),
                        run_time=0.8
                    )
                    
                    # Swap references in VGroup list
                    bars[j], bars[j + 1] = bars[j + 1], bars[j]
                else:
                    no_swap_text = Text(f"No swap needed ({val_left} <= {val_right})", font_size=24, color=GREEN).next_to(title, DOWN)
                    self.play(Transform(status, no_swap_text), run_time=0.3)
                    self.wait(0.3)
                
                # Reset highlight colors
                self.play(
                    bars[j][0].animate.set_fill(orig_color_left, opacity=0.8),
                    bars[j + 1][0].animate.set_fill(orig_color_right, opacity=0.8),
                    run_time=0.3
                )
            
            # Mark sorted element in GREEN
            sorted_bar = bars[n - i - 1]
            self.play(
                sorted_bar[0].animate.set_fill(GREEN, opacity=0.9),
                run_time=0.5
            )

        # Final Completion State
        done_text = Text("Array Fully Sorted!", font_size=28, color=GREEN_A).next_to(title, DOWN)
        self.play(Transform(status, done_text))
        self.wait(2)
