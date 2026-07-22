import os
from string import Template

class PromptManager:
    """Manages loading and rendering of prompt templates."""
    
    def __init__(self, templates_dir: str = "prompts/templates"):
        self.templates_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../..", templates_dir))

    def render(self, template_name: str, **kwargs) -> str:
        """Loads a template file and substitutes variables."""
        file_path = os.path.join(self.templates_dir, template_name)
        
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Template not found: {file_path}")
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        template = Template(content)
        return template.safe_substitute(**kwargs)
