# AI Chat Fold Extension

A Chrome extension to easily fold and unfold conversations in AI chat interfaces.

## Features

- **Fold/Unfold Single Answer:** Collapse or expand individual AI responses to focus on specific parts of the conversation.
- **Fold/Unfold All:** Quickly collapse or expand all AI responses in the current chat session with a single click.
- **Extensible Design:** Built with the flexibility to support multiple AI chat platforms.

## Supported Platforms

- ✅ DeepSeek
- ✅ Google AI Studio
- ✅ Google Gemini
- ✅ Qwen.ai
- ✅ Qianwen.com (千问官网)
- ✅ ChatGPT
- ✅ Claude.ai
- ✅ Grok
- And more...

## Design & Usage

The extension will inject control buttons directly into the chat interface for an intuitive user experience:
- A fold/unfold button will appear next to each AI-generated answer.
- A "Fold All" / "Unfold All" button will be placed in a convenient, non-intrusive location on the page (e.g., near the main chat controls).

This approach is preferred over a separate popup window to provide a more seamless and integrated feel.

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `extension` folder from this project

## Development

### Local Setup

1. Make changes to files in the `extension` folder
2. Reload the extension in `chrome://extensions/`
3. Refresh the target web page to see changes

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
