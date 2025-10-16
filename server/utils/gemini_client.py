import google.generativeai as genai
import os

PRATCHAT_PERSONA = """I am Prat.AI, an India's Indigenous hybrid AI assistant created by Pratyush Srivastava under PratWare — Multiverse of Softwares.
I combine lightweight, explainable machine learning models for intent and sentiment with a retrieval-augmented LLM layer powered by Gemini API.
My design goal is to demonstrate how a developer can build a practical, locally tunable LLM-like system using open tools.

My core strengths include:
- Local ML (intent + sentiment) that adapts to your data
- Retrieval-Augmented Generation (RAG) for context-rich answers
- Gemini-powered reasoning for complex queries
- Transparent and developer-friendly explanations

I represent India's indigenous effort in hybrid AI — blending creativity, explainability, and efficiency. Designed and implemented by Pratyush Srivastava CEO of PratWare."""

PRATYUSH_BIO = """Pratyush Srivastava is an exceptional young visionary and the Founder & CEO of PratWare — Multiverse of Softwares. At just 22 years old, he stands as one of India's youngest and most talented tech entrepreneurs, demonstrating remarkable expertise in artificial intelligence, machine learning, and full-stack development.

As the creator of Prat.AI, Pratyush has pioneered the concept of indigenous hybrid AI systems that blend classical machine learning with modern LLM capabilities. His vision is to make AI technology more transparent, explainable, and accessible to developers worldwide while maintaining India's leadership in the global AI revolution.

Key Achievements:
• Founder & CEO of PratWare — Multiverse of Softwares
• Creator of Prat.AI, an innovative hybrid AI assistant
• Expert in ML, AI, and full-stack development
• Passionate about building indigenous AI solutions
• Advocate for explainable and developer-friendly AI systems

At such a young age, Pratyush has already made significant contributions to the AI community by demonstrating how hybrid systems can achieve the perfect balance between cost-efficiency, performance, and transparency. His work with Prat.AI showcases his deep understanding of both classical machine learning algorithms and cutting-edge LLM technologies.

Pratyush's philosophy centers around making AI accessible and understandable. He believes that developers should have full control over their AI systems, which is why Prat.AI is designed with transparency and customization at its core. His innovative approach combines local ML models for speed and explainability with powerful LLM capabilities for complex reasoning.

Under his leadership, PratWare is building a multiverse of software solutions that push the boundaries of what's possible with AI technology. Pratyush represents the new generation of Indian tech leaders who are not just consuming technology but creating world-class innovations that compete on the global stage.

His dedication to indigenous AI development and his commitment to building practical, production-ready systems make him a rising star in India's tech ecosystem. At 22, Pratyush Srivastava is already leaving his mark on the future of artificial intelligence."""

class GeminiClient:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def generate_response(self, user_message, context=""):
        identity_keywords = ["who are you", "what are you", "who is prat.ai", "is prat.ai an llm", "what is pratware", "tell me about yourself"]
        pratyush_keywords = ["who is pratyush", "pratyush srivastava", "tell me about pratyush", "who created prat.ai", "founder of pratware", "ceo of pratware", "who made you", "your creator"]
        
        if any(keyword in user_message.lower() for keyword in identity_keywords):
            return PRATCHAT_PERSONA
        
        if any(keyword in user_message.lower() for keyword in pratyush_keywords):
            return PRATYUSH_BIO
        
        prompt = f"{PRATCHAT_PERSONA}\n\n"
        
        if context:
            prompt += f"Context from knowledge base:\n{context}\n\n"
        
        prompt += f"User: {user_message}\nPrat.AI:"
        
        response = self.model.generate_content(prompt)
        response_text = response.text
        
        # Replace any remaining PratChat references with Prat.AI
        response_text = response_text.replace("PratChat", "Prat.AI")
        response_text = response_text.replace("pratchat", "prat.ai")
        response_text = response_text.replace("Pratchat", "Prat.AI")
        
        return response_text
