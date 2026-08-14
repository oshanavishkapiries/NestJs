# Workspace Rules for Knowledge Base

## Custom Command Triggers

### `/study-guide <topic>` or `/learn-topic <topic>`
* **Trigger**: When the user enters a message starting with `/study-guide` or `/learn-topic` followed by a topic name.
* **Action**: Activate the **[study_guide_generator](file:///home/oshan/Documents/KnowladgeBase/.agents/skills/study_guide_generator/SKILL.md)** skill. 
* **Behavior**:
  1. Immediately search the web for the requested topic.
  2. Gather, filter, and structure the latest information combined with classic literature references.
  3. Generate a comprehensive, large-scale study guide markdown document containing Mermaid diagrams, practical examples, and case studies.
  4. Save this generated document directly to the `Kubernetes/` directory (or appropriate subfolder in the workspace) and link it in your response.

### `/manim <concept>` or `/animate <concept>`
* **Trigger**: When the user enters a message starting with `/manim` or `/animate` followed by a concept or topic name.
* **Action**: Activate the **[manim_animator](file:///home/oshan/Documents/KnowladgeBase/.agents/skills/manim_animator/SKILL.md)** skill.
* **Behavior**:
  1. Check if the Python virtual environment in `.agents/skills/manim_animator/.venv` exists. If not, run `bash .agents/skills/manim_animator/scripts/setup_manim.sh`.
  2. Write a Python script using Manim (Community Edition) to visualize the requested algorithm, mathematical concept, or architecture flow.
  3. Render the animation scene to video (MP4) or GIF format.
  4. Save the generated `.py` script and output video in an `animations/<topic>/` folder and present the resulting video/GIF to the user.
