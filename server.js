require('dotenv').config();
const express = require('express');
const OpenAI = require("openai");
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const openai = new OpenAI();
app.use(bodyParser.json());
app.use(express.static('public'));

// Ruta para generar títulos sugeridos
app.post('/generate-titles', async (req, res) => {
    const { suggestedTitle } = req.body;
    
    try {
        const prompt = `Genera 10 títulos creativos para un blog basado en el título sugerido: "${suggestedTitle}".`;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Eres un experto en marketing que crea títulos atractivos para blogs. no uses simbolos como * o #" },
                { role: "user", content: prompt }
            ],
        });

        const titles = completion.choices[0].message.content.split("\n").filter(Boolean);

        res.json({ titles });
    } catch (error) {
        console.error('Error al generar los títulos:', error);
        res.status(500).send('Error al generar los títulos.');
    }
});

// Ruta para crear el blog final
app.post('/create-blog', async (req, res) => {
    const { title, style, length, keywords } = req.body;
    
    try {
        const prompt = `Escribe un blog ${length} sobre "${title}". Usa las palabras clave: ${keywords}. Estilo de redacción: ${style}.`;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Eres un escritor de blogs experto que usa técnicas de persuasión y SEO. no uses simbolos como * o #, generas varias secciones con mini titulos, cada seccion consta de 3 grandes parrafos" },
                { role: "user", content: prompt }
            ],
        });

        const blogContent = completion.choices[0].message.content;
        const filePath = path.join(__dirname, 'blog.txt');
        fs.writeFileSync(filePath, blogContent);

        res.download(filePath, 'blog.txt', (err) => {
            if (err) {
                console.error('Error al enviar el archivo:', err);
                res.status(500).send('Error al generar el archivo.');
            } else {
                fs.unlinkSync(filePath);
            }
        });

    } catch (error) {
        console.error('Error al generar el blog:', error);
        res.status(500).send('Error al generar el blog.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
