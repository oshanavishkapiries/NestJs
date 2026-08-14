from manim import *

class BlockchainStructureScene(Scene):
    def construct(self):
        # 0. Setup Canvas Background
        self.camera.background_color = "#0f172a"
        
        # Main Title & Subtitle Banner
        title = Text("Blockchain Architecture: Tx ➔ Block ➔ Blockchain", font="Poppins", font_size=32, color=WHITE)
        title.to_edge(UP, buff=0.3)
        
        banner = Rectangle(height=0.55, width=11.5, fill_color="#1e293b", fill_opacity=0.9, stroke_color="#334155")
        banner.next_to(title, DOWN, buff=0.15)
        
        banner_text = Text("In-Depth Cryptographic Structure & Chain Validation", font="Poppins", font_size=18, color="#38bdf8")
        banner_text.move_to(banner.get_center())
        
        self.play(Write(title), FadeIn(banner), Write(banner_text))
        self.wait(1)

        # =========================================================================
        # PHASE 1: TRANSACTIONS & MEMPOOL
        # =========================================================================
        p1_text = Text("Phase 1: Unconfirmed Transactions in Memory Pool (Mempool)", font="Poppins", font_size=18, color="#fbbf24")
        self.play(Transform(banner_text, p1_text.move_to(banner.get_center())))
        self.wait(0.5)

        mempool_box = RoundedRectangle(corner_radius=0.2, height=3.5, width=10.0, fill_color="#0f172a", fill_opacity=0.8, stroke_color="#475569", stroke_width=2)
        mempool_box.shift(DOWN * 0.5)
        mempool_title = Text("Node Mempool", font="Poppins", font_size=18, color="#94a3b8").next_to(mempool_box.get_top(), DOWN, buff=0.2)

        # Transactions
        tx_data = [
            ("Tx 1", "Alice ➔ Bob: 2.5 BTC"),
            ("Tx 2", "Carol ➔ Dave: 0.8 BTC"),
            ("Tx 3", "Eve ➔ Frank: 4.1 BTC"),
            ("Tx 4", "Grace ➔ Heidi: 1.2 BTC")
        ]
        
        tx_cards = VGroup()
        for idx, (tx_id, tx_detail) in enumerate(tx_data):
            card = RoundedRectangle(corner_radius=0.15, height=1.0, width=4.2, fill_color="#1e293b", fill_opacity=0.9, stroke_color="#38bdf8")
            t1 = Text(tx_id, font="Poppins", font_size=16, color="#38bdf8").move_to(card.get_top() + DOWN * 0.25)
            t2 = Text(tx_detail, font="Poppins", font_size=13, color=WHITE).move_to(card.get_bottom() + UP * 0.3)
            tx_group = VGroup(card, t1, t2)
            tx_cards.add(tx_group)

        tx_cards.arrange_in_grid(rows=2, cols=2, buff=0.4).move_to(mempool_box.get_center() + DOWN * 0.2)

        self.play(Create(mempool_box), Write(mempool_title))
        self.play(LaggedStart(*[FadeIn(card, shift=UP * 0.3) for card in tx_cards], lag_ratio=0.3))
        self.wait(1.5)

        self.play(FadeOut(mempool_box), FadeOut(mempool_title), FadeOut(tx_cards))

        # =========================================================================
        # PHASE 2: MERKLE TREE HASHING
        # =========================================================================
        p2_text = Text("Phase 2: Merkle Tree Construction (Binary Hash Tree)", font="Poppins", font_size=18, color="#a855f7")
        self.play(Transform(banner_text, p2_text.move_to(banner.get_center())))
        self.wait(0.5)

        # Leaf Nodes (Transactions 1 to 4)
        leaves = VGroup()
        leaf_labels = ["Tx 1", "Tx 2", "Tx 3", "Tx 4"]
        for i, l_text in enumerate(leaf_labels):
            box = RoundedRectangle(corner_radius=0.1, height=0.6, width=1.8, fill_color="#1e293b", fill_opacity=0.9, stroke_color="#38bdf8")
            txt = Text(l_text, font="Poppins", font_size=14, color=WHITE).move_to(box.get_center())
            leaves.add(VGroup(box, txt))
        leaves.arrange(RIGHT, buff=0.8).move_to(DOWN * 2.2)

        # Layer 1 Hashes: H1, H2, H3, H4
        h_layer1 = VGroup()
        for i in range(4):
            box = RoundedRectangle(corner_radius=0.1, height=0.6, width=1.8, fill_color="#3b0764", fill_opacity=0.8, stroke_color="#c084fc")
            txt = Text(f"H({i+1})", font="Poppins", font_size=14, color="#e9d5ff").move_to(box.get_center())
            h_layer1.add(VGroup(box, txt))
        h_layer1.arrange(RIGHT, buff=0.8).next_to(leaves, UP, buff=0.6)

        # Layer 2 Hashes: H12, H34
        h_layer2 = VGroup()
        for label in ["H(1+2)", "H(3+4)"]:
            box = RoundedRectangle(corner_radius=0.1, height=0.6, width=2.4, fill_color="#581c87", fill_opacity=0.9, stroke_color="#a855f7")
            txt = Text(label, font="Poppins", font_size=14, color="#f0abfc").move_to(box.get_center())
            h_layer2.add(VGroup(box, txt))
        h_layer2.arrange(RIGHT, buff=3.0).next_to(h_layer1, UP, buff=0.7)

        # Root Hash: Merkle Root
        root_box = RoundedRectangle(corner_radius=0.15, height=0.7, width=3.8, fill_color="#7e22ce", fill_opacity=1.0, stroke_color="#f43f5e", stroke_width=2)
        root_txt = Text("Merkle Root: H(12+34)", font="Poppins", font_size=15, color=WHITE).move_to(root_box.get_center())
        merkle_root = VGroup(root_box, root_txt).next_to(h_layer2, UP, buff=0.8)

        # Arrows connecting tree levels
        arrows_l1 = VGroup(*[Arrow(leaves[i].get_top(), h_layer1[i].get_bottom(), buff=0.05, color="#94a3b8") for i in range(4)])
        
        arrows_l2 = VGroup(
            Arrow(h_layer1[0].get_top(), h_layer2[0].get_bottom(), buff=0.05, color="#c084fc"),
            Arrow(h_layer1[1].get_top(), h_layer2[0].get_bottom(), buff=0.05, color="#c084fc"),
            Arrow(h_layer1[2].get_top(), h_layer2[1].get_bottom(), buff=0.05, color="#c084fc"),
            Arrow(h_layer1[3].get_top(), h_layer2[1].get_bottom(), buff=0.05, color="#c084fc")
        )

        arrows_root = VGroup(
            Arrow(h_layer2[0].get_top(), merkle_root.get_bottom(), buff=0.05, color="#f43f5e"),
            Arrow(h_layer2[1].get_top(), merkle_root.get_bottom(), buff=0.05, color="#f43f5e")
        )

        self.play(FadeIn(leaves))
        self.play(Create(arrows_l1), FadeIn(h_layer1))
        self.play(Create(arrows_l2), FadeIn(h_layer2))
        self.play(Create(arrows_root), Write(merkle_root))
        self.wait(1.5)

        merkle_tree_all = VGroup(leaves, h_layer1, h_layer2, merkle_root, arrows_l1, arrows_l2, arrows_root)
        self.play(merkle_tree_all.animate.scale(0.55).to_edge(RIGHT, buff=0.5).shift(DOWN * 0.3))

        # =========================================================================
        # PHASE 3: BLOCK STRUCTURE ANATOMY
        # =========================================================================
        p3_text = Text("Phase 3: Anatomy of Block Header & Block Body", font="Poppins", font_size=18, color="#38bdf8")
        self.play(Transform(banner_text, p3_text.move_to(banner.get_center())))
        self.wait(0.5)

        block_outline = RoundedRectangle(corner_radius=0.2, height=4.5, width=4.5, fill_color="#0f172a", fill_opacity=0.9, stroke_color="#38bdf8", stroke_width=2)
        block_outline.to_edge(LEFT, buff=0.8).shift(DOWN * 0.3)

        b_header_bg = RoundedRectangle(corner_radius=0.1, height=2.6, width=4.1, fill_color="#1e293b", fill_opacity=0.9, stroke_color="#0ea5e9")
        b_header_bg.move_to(block_outline.get_top() + DOWN * 1.55)

        h_title = Text("BLOCK HEADER", font="Poppins", font_size=14, color="#38bdf8").move_to(b_header_bg.get_top() + DOWN * 0.25)
        f1 = Text("Prev Block Hash: 0000a4...f8", font="Poppins", font_size=11, color="#94a3b8").next_to(h_title, DOWN, buff=0.15)
        f2 = Text("Merkle Root: H(12+34)", font="Poppins", font_size=11, color="#f43f5e").next_to(f1, DOWN, buff=0.1)
        f3 = Text("Timestamp: 1771115049", font="Poppins", font_size=11, color="#94a3b8").next_to(f2, DOWN, buff=0.1)
        f4 = Text("Difficulty Target: 4 Zeros", font="Poppins", font_size=11, color="#fbbf24").next_to(f3, DOWN, buff=0.1)
        
        nonce_val = Variable(0, Text("Nonce", font="Poppins", font_size=12, color="#4ade80"), var_type=Integer)
        nonce_val.next_to(f4, DOWN, buff=0.1).scale(0.85)

        header_group = VGroup(b_header_bg, h_title, f1, f2, f3, f4, nonce_val)

        b_body_bg = RoundedRectangle(corner_radius=0.1, height=1.3, width=4.1, fill_color="#0284c7", fill_opacity=0.2, stroke_color="#0ea5e9")
        b_body_bg.move_to(block_outline.get_bottom() + UP * 0.85)

        body_title = Text("BLOCK BODY (Transactions)", font="Poppins", font_size=12, color="#7dd3fc").move_to(b_body_bg.get_top() + DOWN * 0.2)
        body_txs = Text("[Tx 1, Tx 2, Tx 3, Tx 4]", font="Poppins", font_size=11, color=WHITE).next_to(body_title, DOWN, buff=0.15)
        body_group = VGroup(b_body_bg, body_title, body_txs)

        self.play(Create(block_outline), FadeIn(header_group), FadeIn(body_group))
        self.wait(1)

        # Highlight Merkle Root link
        link_arrow = Arrow(merkle_root.get_left(), f2.get_right(), color="#f43f5e", stroke_width=3)
        self.play(Create(link_arrow))
        self.wait(1.5)
        self.play(FadeOut(link_arrow), FadeOut(merkle_tree_all))

        # =========================================================================
        # PHASE 4: PROOF OF WORK MINING
        # =========================================================================
        p4_text = Text("Phase 4: Proof-of-Work (SHA-256 Hashing & Nonce Mining)", font="Poppins", font_size=18, color="#4ade80")
        self.play(Transform(banner_text, p4_text.move_to(banner.get_center())))
        self.wait(0.5)

        miner_box = RoundedRectangle(corner_radius=0.15, height=4.5, width=5.5, fill_color="#1e293b", fill_opacity=0.9, stroke_color="#4ade80")
        miner_box.to_edge(RIGHT, buff=0.8).shift(DOWN * 0.3)

        m_title = Text("SHA-256 Mining Engine", font="Poppins", font_size=16, color="#4ade80").move_to(miner_box.get_top() + DOWN * 0.3)
        target_text = Text("Target: Hash must start with '0000'", font="Poppins", font_size=12, color="#fbbf24").next_to(m_title, DOWN, buff=0.2)
        
        hash_label = Text("Current Header Hash:", font="Poppins", font_size=12, color="#94a3b8").next_to(target_text, DOWN, buff=0.4)
        hash_display = Text("9f8a3c...d4a1", font="Poppins", font_size=16, color="#ef4444").next_to(hash_label, DOWN, buff=0.2)

        self.play(Create(miner_box), Write(m_title), Write(target_text), Write(hash_label), Write(hash_display))
        self.wait(1)

        # Simulate mining iteration
        sample_hashes = [
            (12, "8b12f4...0a92"),
            (489, "3c77e1...f902"),
            (2150, "1a08b3...7c54"),
            (48291, "0000a3...b7e9")
        ]

        for n_val, h_str in sample_hashes:
            is_target = h_str.startswith("0000")
            h_color = "#4ade80" if is_target else "#ef4444"
            
            new_hash = Text(h_str, font="Poppins", font_size=16, color=h_color).move_to(hash_display.get_center())
            self.play(
                nonce_val.tracker.animate.set_value(n_val),
                Transform(hash_display, new_hash),
                run_time=0.4
            )
            self.wait(0.2)

        success_box = SurroundingRectangle(hash_display, color="#4ade80", buff=0.15)
        mined_banner = Text("✔ BLOCK MINED SUCCESSFULLY!", font="Poppins", font_size=16, color="#4ade80").next_to(miner_box.get_bottom(), UP, buff=0.4)
        self.play(Create(success_box), Write(mined_banner))
        self.wait(1.5)

        self.play(FadeOut(miner_box), FadeOut(m_title), FadeOut(target_text), FadeOut(hash_label), FadeOut(hash_display), FadeOut(success_box), FadeOut(mined_banner), FadeOut(block_outline), FadeOut(header_group), FadeOut(body_group))

        # =========================================================================
        # PHASE 5: BLOCKCHAIN CHAINING & IMMUTABILITY DEMO
        # =========================================================================
        p5_text = Text("Phase 5: Blockchain Chaining & Cryptographic Immutability", font="Poppins", font_size=18, color="#f43f5e")
        self.play(Transform(banner_text, p5_text.move_to(banner.get_center())))
        self.wait(0.5)

        def create_block(b_num, prev_hash, curr_hash, color_accent="#38bdf8"):
            box = RoundedRectangle(corner_radius=0.15, height=3.2, width=2.7, fill_color="#0f172a", fill_opacity=0.95, stroke_color=color_accent, stroke_width=2)
            header_bar = Rectangle(height=0.5, width=2.7, fill_color=color_accent, fill_opacity=0.3, stroke_width=0).move_to(box.get_top() + DOWN * 0.25)
            t_num = Text(f"Block #{b_num}", font="Poppins", font_size=14, color=WHITE).move_to(header_bar.get_center())
            
            p_lbl = Text("Prev Hash:", font="Poppins", font_size=10, color="#94a3b8")
            p_val = Text(prev_hash, font="Poppins", font_size=10, color="#94a3b8")
            p_txt = VGroup(p_lbl, p_val).arrange(DOWN, buff=0.05).move_to(box.get_center() + UP * 0.4)
            
            h_lbl = Text("Hash:", font="Poppins", font_size=10, color=color_accent)
            h_val = Text(curr_hash, font="Poppins", font_size=10, color=color_accent)
            h_txt = VGroup(h_lbl, h_val).arrange(DOWN, buff=0.05).move_to(box.get_center() + DOWN * 0.6)
            
            return VGroup(box, header_bar, t_num, p_txt, h_txt)

        b1 = create_block(101, "00008f...12", "0000a3...b7", "#38bdf8")
        b2 = create_block(102, "0000a3...b7", "00007c...99", "#38bdf8")
        b3 = create_block(103, "00007c...99", "00004e...11", "#38bdf8")

        chain_group = VGroup(b1, b2, b3).arrange(RIGHT, buff=1.0).move_to(DOWN * 0.4)
        
        arrow_12 = Arrow(b1.get_right() + DOWN * 0.4, b2.get_left() + UP * 0.4, color="#38bdf8", buff=0.1)
        arrow_23 = Arrow(b2.get_right() + DOWN * 0.4, b3.get_left() + UP * 0.4, color="#38bdf8", buff=0.1)

        self.play(FadeIn(chain_group), Create(arrow_12), Create(arrow_23))
        self.wait(1.5)

        # Tampering simulation
        tamper_label = Text("⚠️ Attacker modifies Tx 1 in Block #101!", font="Poppins", font_size=15, color="#ef4444").move_to(UP * 1.5)
        self.play(Write(tamper_label))
        
        # Avalanche effect in Block 101
        b1_invalid = create_block(101, "00008f...12", "9x41c8...a0", "#ef4444").move_to(b1.get_center())
        b2_invalid = create_block(102, "0000a3...b7", "7d21b0...ef", "#ef4444").move_to(b2.get_center())
        b3_invalid = create_block(103, "00007c...99", "3e99a1...12", "#ef4444").move_to(b3.get_center())

        arrow_12_broken = Arrow(b1.get_right() + DOWN * 0.4, b2.get_left() + UP * 0.4, color="#ef4444", buff=0.1)
        arrow_23_broken = Arrow(b2.get_right() + DOWN * 0.4, b3.get_left() + UP * 0.4, color="#ef4444", buff=0.1)

        self.play(Transform(b1, b1_invalid))
        self.wait(0.5)
        self.play(Transform(arrow_12, arrow_12_broken), Transform(b2, b2_invalid))
        self.play(Transform(arrow_23, arrow_23_broken), Transform(b3, b3_invalid))
        
        invalid_banner = Text("❌ BROKEN HASH POINTERS - CHAIN REJECTED!", font="Poppins", font_size=16, color="#ef4444").move_to(DOWN * 2.8)
        self.play(Write(invalid_banner))
        self.wait(2.5)

        self.play(FadeOut(chain_group), FadeOut(arrow_12), FadeOut(arrow_23), FadeOut(tamper_label), FadeOut(invalid_banner))

        # =========================================================================
        # PHASE 6: SUMMARY TAKEAWAY
        # =========================================================================
        summary_card = RoundedRectangle(corner_radius=0.2, height=3.2, width=10.5, fill_color="#0f172a", fill_opacity=0.95, stroke_color="#38bdf8", stroke_width=2)
        summary_card.move_to(DOWN * 0.4)

        sum_title = Text("Core Blockchain Takeaways", font="Poppins", font_size=20, color="#38bdf8").move_to(summary_card.get_top() + DOWN * 0.35)
        b1_txt = Text("1. Transactions are aggregated into a cryptographic Merkle Tree (Merkle Root).", font="Poppins", font_size=14, color="#e2e8f0").next_to(sum_title, DOWN, buff=0.3).align_to(summary_card, LEFT).shift(RIGHT * 0.5)
        b2_txt = Text("2. Proof-of-Work (Nonce Mining) ensures computational consensus & security.", font="Poppins", font_size=14, color="#e2e8f0").next_to(b1_txt, DOWN, buff=0.2).align_to(b1_txt, LEFT)
        b3_txt = Text("3. Cryptographic Hash Pointers (Prev Hash) link blocks sequentially into an immutable ledger.", font="Poppins", font_size=14, color="#e2e8f0").next_to(b2_txt, DOWN, buff=0.2).align_to(b1_txt, LEFT)

        summary_group = VGroup(summary_card, sum_title, b1_txt, b2_txt, b3_txt)
        self.play(FadeIn(summary_group))
        self.wait(3)
