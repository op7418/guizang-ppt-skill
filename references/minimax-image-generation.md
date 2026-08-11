# MiniMax Image Generation

Use the bundled Node.js adapter when a deck needs text-to-image assets generated through MiniMax. The adapter uses only built-in Node.js APIs and requires Node.js 18 or newer.

## Configuration

- API key environment variable: `MINIMAX_API_KEY`
- Default model: `image-01`
- Supported models: `image-01, image-01-live`
- Default response format: `url`
- Supported response formats: `url, base64`

| Region | Endpoint |
|---|---|
| `global_en` | `https://api.minimax.io/v1/image_generation` |
| `cn_zh` | `https://api.minimaxi.com/v1/image_generation` |

Keep the API key in the environment. Do not pass it as a command-line argument or write it into deck files.

## Generate One Deck Image

```bash
node "<SKILL_ROOT>/scripts/generate-minimax-image.mjs" \
  --region global_en \
  --model image-01 \
  --prompt "Editorial documentary scene with generous negative space" \
  --aspect-ratio 16:9 \
  --output "project/ppt/images/03-editorial-scene.png"
```

Use `--region cn_zh` for the China endpoint. Use `--model image-01-live` when live image generation is required.

The adapter sends `model`, `prompt`, `response_format`, and `n`. It also supports `aspect_ratio`, `width`, `height`, `seed`, and `prompt_optimizer`.

## Response Handling

The adapter reads generated images from `data.image_urls`.

- URL entries are downloaded immediately to the requested deck path.
- Data URI and raw base64 entries are decoded and written to disk.
- Multiple images add `-1`, `-2`, and later numeric suffixes before the extension.
- Generated URLs expire after 24 hours, so the adapter never leaves a temporary URL in the deck.

The command prints a JSON summary containing saved file paths and response counts. It never prints the API key.

## Checks

```bash
node --test scripts/generate-minimax-image.test.mjs
node scripts/generate-minimax-image.mjs --help
```
