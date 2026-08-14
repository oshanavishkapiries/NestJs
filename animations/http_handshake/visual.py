from manim import *

class HTTPHandshakeScene(Scene):
    def construct(self):
        # 0. Setup Background & Colors
        self.camera.background_color = "#0f172a"
        
        # Title
        title = Text("HTTP / HTTPS Handshake Deep Dive", font="Poppins", font_size=36, color=WHITE)
        title.to_edge(UP, buff=0.4)
        
        phase_banner = Rectangle(height=0.6, width=11.0, fill_color="#1e293b", fill_opacity=0.9, stroke_color="#475569")
        phase_banner.next_to(title, DOWN, buff=0.2)
        
        phase_text = Text("Overview: From TCP to TLS to HTTP Data Transfer", font="Poppins", font_size=20, color="#94a3b8")
        phase_text.move_to(phase_banner.get_center())
        
        self.play(Write(title), FadeIn(phase_banner), Write(phase_text))
        self.wait(1)
        
        # 1. Setup Architecture (Client & Server Nodes)
        client_box = RoundedRectangle(corner_radius=0.2, height=1.8, width=2.4, fill_color="#0284c7", fill_opacity=0.3, stroke_color="#38bdf8", stroke_width=2)
        client_box.move_to(LEFT * 4.8 + UP * 0.5)
        client_icon = Text("💻", font_size=32).move_to(client_box.get_center() + UP * 0.3)
        client_label = Text("Client / Browser", font="Poppins", font_size=18, color="#f0f9ff").move_to(client_box.get_center() + DOWN * 0.4)
        client_group = VGroup(client_box, client_icon, client_label)
        
        server_box = RoundedRectangle(corner_radius=0.2, height=1.8, width=2.4, fill_color="#16a34a", fill_opacity=0.3, stroke_color="#4ade80", stroke_width=2)
        server_box.move_to(RIGHT * 4.8 + UP * 0.5)
        server_icon = Text("🖥️", font_size=32).move_to(server_box.get_center() + UP * 0.3)
        server_label = Text("Web Server", font="Poppins", font_size=18, color="#f0fdf4").move_to(server_box.get_center() + DOWN * 0.4)
        server_group = VGroup(server_box, server_icon, server_label)
        
        self.play(FadeIn(client_group, shift=RIGHT), FadeIn(server_group, shift=LEFT))
        self.wait(1)
        
        # Lifelines / Sequence Lanes
        client_line = Line(client_box.get_bottom(), client_box.get_bottom() + DOWN * 4.5, color="#334155", stroke_width=2)
        server_line = Line(server_box.get_bottom(), server_box.get_bottom() + DOWN * 4.5, color="#334155", stroke_width=2)
        self.play(Create(client_line), Create(server_line))
        
        # ----------------------------------------------------
        # PHASE 1: TCP 3-Way Handshake
        # ----------------------------------------------------
        phase1_text = Text("Phase 1: TCP 3-Way Handshake (Transport Layer)", font="Poppins", font_size=20, color="#f59e0b")
        self.play(Transform(phase_text, phase1_text.move_to(phase_banner.get_center())))
        self.wait(0.5)
        
        # Step 1: SYN
        y_step1 = 1.0
        p1_start = client_box.get_bottom() + DOWN * 0.4
        p1_end = server_box.get_bottom() + DOWN * 1.0
        
        arrow_syn = Arrow(p1_start, p1_end, buff=0, color="#f59e0b", stroke_width=3, max_tip_length_to_length_ratio=0.08)
        syn_label = Text("1. SYN (seq=x)", font="Poppins", font_size=16, color="#fbbf24")
        syn_label.next_to(arrow_syn.get_center(), UP, buff=0.1).rotate(arrow_syn.get_angle())
        
        packet_syn = Dot(color="#fbbf24", radius=0.15).move_to(p1_start)
        
        self.play(Create(arrow_syn), Write(syn_label))
        self.play(MoveAlongPath(packet_syn, arrow_syn), run_time=1.2)
        self.play(FadeOut(packet_syn))
        
        # Step 2: SYN-ACK
        p2_start = server_box.get_bottom() + DOWN * 1.2
        p2_end = client_box.get_bottom() + DOWN * 1.8
        
        arrow_synack = Arrow(p2_start, p2_end, buff=0, color="#38bdf8", stroke_width=3, max_tip_length_to_length_ratio=0.08)
        synack_label = Text("2. SYN-ACK (seq=y, ack=x+1)", font="Poppins", font_size=16, color="#7dd3fc")
        synack_label.next_to(arrow_synack.get_center(), UP, buff=0.1).rotate(arrow_synack.get_angle())
        
        packet_synack = Dot(color="#7dd3fc", radius=0.15).move_to(p2_start)
        
        self.play(Create(arrow_synack), Write(synack_label))
        self.play(MoveAlongPath(packet_synack, arrow_synack), run_time=1.2)
        self.play(FadeOut(packet_synack))
        
        # Step 3: ACK
        p3_start = client_box.get_bottom() + DOWN * 2.0
        p3_end = server_box.get_bottom() + DOWN * 2.6
        
        arrow_ack = Arrow(p3_start, p3_end, buff=0, color="#4ade80", stroke_width=3, max_tip_length_to_length_ratio=0.08)
        ack_label = Text("3. ACK (ack=y+1)", font="Poppins", font_size=16, color="#86efac")
        ack_label.next_to(arrow_ack.get_center(), UP, buff=0.1).rotate(arrow_ack.get_angle())
        
        packet_ack = Dot(color="#86efac", radius=0.15).move_to(p3_start)
        
        self.play(Create(arrow_ack), Write(ack_label))
        self.play(MoveAlongPath(packet_ack, arrow_ack), run_time=1.2)
        self.play(FadeOut(packet_ack))
        
        tcp_status = Text("✔ TCP Socket Connected (1 RTT)", font="Poppins", font_size=16, color="#4ade80")
        tcp_status.move_to(DOWN * 2.8)
        self.play(Write(tcp_status))
        self.wait(1.5)
        
        # Clear TCP arrows to prepare for TLS/HTTP phase
        tcp_group = VGroup(arrow_syn, syn_label, arrow_synack, synack_label, arrow_ack, ack_label, tcp_status)
        self.play(FadeOut(tcp_group))
        
        # ----------------------------------------------------
        # PHASE 2: TLS 1.3 Handshake (Security Layer)
        # ----------------------------------------------------
        phase2_text = Text("Phase 2: TLS 1.3 Handshake (Security & Key Exchange)", font="Poppins", font_size=20, color="#c084fc")
        self.play(Transform(phase_text, phase2_text.move_to(phase_banner.get_center())))
        self.wait(0.5)
        
        # Step 4: ClientHello
        p4_start = client_box.get_bottom() + DOWN * 0.4
        p4_end = server_box.get_bottom() + DOWN * 1.0
        arrow_chello = Arrow(p4_start, p4_end, buff=0, color="#c084fc", stroke_width=3)
        chello_label = Text("4. ClientHello (Key Share + CipherSuites)", font="Poppins", font_size=15, color="#e9d5ff")
        chello_label.next_to(arrow_chello.get_center(), UP, buff=0.1).rotate(arrow_chello.get_angle())
        
        packet_chello = Dot(color="#e9d5ff", radius=0.15).move_to(p4_start)
        self.play(Create(arrow_chello), Write(chello_label))
        self.play(MoveAlongPath(packet_chello, arrow_chello), run_time=1.2)
        self.play(FadeOut(packet_chello))
        
        # Step 5: ServerHello + Cert + Finished
        p5_start = server_box.get_bottom() + DOWN * 1.3
        p5_end = client_box.get_bottom() + DOWN * 1.9
        arrow_shello = Arrow(p5_start, p5_end, buff=0, color="#a855f7", stroke_width=3)
        shello_label = Text("5. ServerHello (Selected Cipher + Cert + Key Share)", font="Poppins", font_size=14, color="#f0abfc")
        shello_label.next_to(arrow_shello.get_center(), UP, buff=0.1).rotate(arrow_shello.get_angle())
        
        packet_shello = Dot(color="#f0abfc", radius=0.15).move_to(p5_start)
        self.play(Create(arrow_shello), Write(shello_label))
        self.play(MoveAlongPath(packet_shello, arrow_shello), run_time=1.2)
        self.play(FadeOut(packet_shello))
        
        # Key Generation Visual
        lock_client = Text("🔒", font_size=24).next_to(client_box, LEFT, buff=0.2)
        lock_server = Text("🔒", font_size=24).next_to(server_box, RIGHT, buff=0.2)
        key_label = Text("Symmetric Session Key Derived (ECDHE)", font="Poppins", font_size=16, color="#f472b6")
        key_label.move_to(DOWN * 2.2)
        
        self.play(FadeIn(lock_client), FadeIn(lock_server), Write(key_label))
        self.wait(1.5)
        
        tls_group = VGroup(arrow_chello, chello_label, arrow_shello, shello_label, key_label)
        self.play(FadeOut(tls_group))
        
        # ----------------------------------------------------
        # PHASE 3: HTTP Request & Response Data Exchange
        # ----------------------------------------------------
        phase3_text = Text("Phase 3: HTTP Application Layer Data Transfer", font="Poppins", font_size=20, color="#38bdf8")
        self.play(Transform(phase_text, phase3_text.move_to(phase_banner.get_center())))
        self.wait(0.5)
        
        # HTTP Request
        p6_start = client_box.get_bottom() + DOWN * 0.5
        p6_end = server_box.get_bottom() + DOWN * 1.1
        arrow_httpreq = Arrow(p6_start, p6_end, buff=0, color="#38bdf8", stroke_width=4)
        httpreq_label = Text("6. GET /api/v1/resource (Encrypted HTTP)", font="Poppins", font_size=15, color="#7dd3fc")
        httpreq_label.next_to(arrow_httpreq.get_center(), UP, buff=0.1).rotate(arrow_httpreq.get_angle())
        
        req_box = RoundedRectangle(corner_radius=0.1, height=0.4, width=0.8, fill_color="#0284c7", fill_opacity=0.9, stroke_color=WHITE)
        req_text = Text("HTTP", font="Poppins", font_size=12, color=WHITE).move_to(req_box.get_center())
        packet_req = VGroup(req_box, req_text).move_to(p6_start)
        
        self.play(Create(arrow_httpreq), Write(httpreq_label))
        self.play(MoveAlongPath(packet_req, arrow_httpreq), run_time=1.5)
        self.play(FadeOut(packet_req))
        
        # HTTP Response
        p7_start = server_box.get_bottom() + DOWN * 1.5
        p7_end = client_box.get_bottom() + DOWN * 2.1
        arrow_httpres = Arrow(p7_start, p7_end, buff=0, color="#22c55e", stroke_width=4)
        httpres_label = Text("7. HTTP/1.1 200 OK (JSON Payload)", font="Poppins", font_size=15, color="#86efac")
        httpres_label.next_to(arrow_httpres.get_center(), UP, buff=0.1).rotate(arrow_httpres.get_angle())
        
        res_box = RoundedRectangle(corner_radius=0.1, height=0.4, width=0.8, fill_color="#16a34a", fill_opacity=0.9, stroke_color=WHITE)
        res_text = Text("200 OK", font="Poppins", font_size=10, color=WHITE).move_to(res_box.get_center())
        packet_res = VGroup(res_box, res_text).move_to(p7_start)
        
        self.play(Create(arrow_httpres), Write(httpres_label))
        self.play(MoveAlongPath(packet_res, arrow_httpres), run_time=1.5)
        self.play(FadeOut(packet_res))
        
        # Final Summary Card
        summary_card = RoundedRectangle(corner_radius=0.2, height=1.6, width=10.0, fill_color="#0f172a", fill_opacity=0.95, stroke_color="#38bdf8", stroke_width=2)
        summary_card.move_to(DOWN * 2.5)
        
        sum_title = Text("Key Takeaways", font="Poppins", font_size=18, color="#38bdf8").move_to(summary_card.get_top() + DOWN * 0.25)
        bullet1 = Text("• TCP Handshake (1 RTT): Establishes reliable sequence numbers (SYN, SYN-ACK, ACK)", font="Poppins", font_size=13, color="#e2e8f0").next_to(sum_title, DOWN, buff=0.15).align_to(summary_card, LEFT).shift(RIGHT * 0.4)
        bullet2 = Text("• TLS 1.3 Handshake (1 RTT): Negotiates encryption & authenticates server certificate", font="Poppins", font_size=13, color="#e2e8f0").next_to(bullet1, DOWN, buff=0.1).align_to(bullet1, LEFT)
        bullet3 = Text("• HTTP Request/Response: Transfers application payload over secure, reliable socket", font="Poppins", font_size=13, color="#e2e8f0").next_to(bullet2, DOWN, buff=0.1).align_to(bullet1, LEFT)
        
        summary_group = VGroup(summary_card, sum_title, bullet1, bullet2, bullet3)
        self.play(FadeIn(summary_group))
        self.wait(3)
