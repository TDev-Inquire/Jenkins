require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const OpenAIApi = require('openai');

const openai = new OpenAIApi({ apiKey: process.env.OPENAI_API_KEY });

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const CHANNEL_NAME = "➤chat";
const CHANNEL_ID = "1069267297132367954";

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // General GPT response for questions without mention
    if (!message.mentions.has(client.user)) {
        try {
            const response = await openai.completions.create({
                model: "text-davinci-003",
                prompt: message.content,
                max_tokens: 150
            });
            if (response.choices && response.choices.length > 0) {
                message.channel.send(response.choices[0].text.trim());
            }
        } catch (error) {
            console.error('Error with OpenAI response:', error);
        }
        return;
    }   

    // Handling mentions
    const content = message.content.split(' ').slice(1).join(' ');

    if (content.startsWith('image:')) {
        const imagePrompt = content.split('image:')[1].trim();
        console.log(`Image generation requested with prompt: ${imagePrompt}`);
        
        // Generate an image description using GPT-3.5 Turbo
        try {
            const imageResponse = await client.images.generate({
                model: "image-alpha-001",
                prompt: `Generate an image of: ${imagePrompt}`,
                n: 1,
                size: "1024x1024",
                output_format: "url",
            });
    
            if (imageResponse.data && imageResponse.data.length > 0) {
                const generatedImageURL = imageResponse.data[0].url;
                // You can send the generated image URL as a response
                message.channel.send(generatedImageURL);
            }
        } catch (error) {
            console.error('Error with OpenAI response:', error);
        }    } else if (content.startsWith('howto:')) {
        const howtoPrompt = content.split('howto:')[1].trim();
        console.log(`How-to guide requested for: ${howtoPrompt}`);
        // Generate a how-to guide using GPT-3.5 Turbo
        try {
            const howtoResponse = await openai.completions.create({
                model: "text-davinci-003",
                prompt: `Generate a how-to guide for: ${howtoPrompt}`,
                max_tokens: 150
            });

            if (howtoResponse.choices && howtoResponse.choices.length > 0) {
                const generatedHowToGuide = howtoResponse.choices[0].text.trim();
                // Send the generated how-to guide as a response
                message.channel.send(generatedHowToGuide);
            }
        } catch (error) {
            console.error('Error with OpenAI response:', error);
        }
    } else {
        // Handle general GPT response
        try {
            const gptResponse = await openai.completions.create({
                model: "text-davinci-003",
                prompt: content,
                max_tokens: 150
            });
            if (gptResponse.choices && gptResponse.choices.length > 0) {
                message.channel.send(gptResponse.choices[0].text.trim());
            }
        } catch (error) {
            console.error('Error with OpenAI response:', error);
        }
    }
});

// Function to generate an image based on the description (You need to implement this)
function generateImageFromDescription(description) {
    // Implement your image generation logic here
    // For example, you can use a library like 'canvas' or 'sharp' to create images based on the description.
    // Return the generated image as a buffer or file path.
}

client.login(process.env.DISCORD_BOT_TOKEN);
