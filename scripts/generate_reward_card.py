from __future__ import annotations

import argparse
import re
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

BASE = Path(__file__).resolve().parent.parent
PUBLIC = BASE / 'public'
FONT_DIR = PUBLIC / 'fonts'
LOGO_JPG = PUBLIC / 'Rapyder_Logo.jpg'

TEMPLATE_1 = PUBLIC / 'Template_Card 1.jpeg'
TEMPLATE_2 = PUBLIC / 'Template_Card 2.jpeg'

BASE_OUTPUT_WIDTH = 768
BASE_OUTPUT_HEIGHT = 1408
DEFAULT_SCALE = 2

# These are bundled project assets, so suppressing the decompression warning is safe here.
Image.MAX_IMAGE_PIXELS = None
RESAMPLE = Image.Resampling.LANCZOS

FONT_FILES = {
    'regular': FONT_DIR / 'DMSans-Regular.ttf',
    'medium': FONT_DIR / 'DMSans-Medium.ttf',
    'bold': FONT_DIR / 'DMSans-Bold.ttf',
    'italic': FONT_DIR / 'DMSans-Italic.ttf',
}

WINDOWS_FALLBACKS = {
    'regular': 'arial.ttf',
    'medium': 'arial.ttf',
    'bold': 'arialbd.ttf',
    'italic': 'ariali.ttf',
}


def scale_px(value: int, scale: int) -> int:
    return int(round(value * scale))


def load_font(weight: str, size: int):
    return _load_font_cached(weight, size)


@lru_cache(maxsize=None)
def _load_font_cached(weight: str, size: int):
    font_path = FONT_FILES.get(weight)
    if font_path and font_path.exists():
        return ImageFont.truetype(str(font_path), size)
    fallback = Path('C:/Windows/Fonts') / WINDOWS_FALLBACKS.get(weight, 'arial.ttf')
    if fallback.exists():
        return ImageFont.truetype(str(fallback), size)
    return ImageFont.load_default()


def slugify(value: str) -> str:
    slug = re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')
    return slug or 'player'


def fit_text(draw: ImageDraw.ImageDraw, text: str, weight: str, max_size: int, min_size: int, max_width: int, scale: int):
    scaled_max_size = scale_px(max_size, scale)
    scaled_min_size = max(1, scale_px(min_size, scale))
    scaled_max_width = scale_px(max_width, scale)

    size = scaled_max_size
    while size >= scaled_min_size:
        font = load_font(weight, size)
        bbox = draw.textbbox((0, 0), text, font=font)
        if (bbox[2] - bbox[0]) <= scaled_max_width:
            return font
        size -= max(1, scale)
    return load_font(weight, scaled_min_size)


@lru_cache(maxsize=None)
def load_template(path_str: str, scale: int) -> Image.Image:
    output_size = (scale_px(BASE_OUTPUT_WIDTH, scale), scale_px(BASE_OUTPUT_HEIGHT, scale))
    with Image.open(path_str) as img:
        template = img.convert('RGBA')
    if template.size != output_size:
        template = template.resize(output_size, RESAMPLE)
    return template


@lru_cache(maxsize=None)
def rasterize_logo(max_width: int, scale: int) -> Image.Image:
    with Image.open(LOGO_JPG) as img:
        logo = img.convert('RGBA')

    pixels = logo.load()
    for y in range(logo.height):
        for x in range(logo.width):
            r, g, b, _ = pixels[x, y]
            if r < 24 and g < 24 and b < 24:
                pixels[x, y] = (0, 0, 0, 0)

    alpha = logo.getchannel('A')
    bbox = alpha.getbbox()
    if bbox:
        logo = logo.crop(bbox)

    target_width = scale_px(max_width, scale)
    ratio = target_width / logo.width
    return logo.resize((int(logo.width * ratio), int(logo.height * ratio)), RESAMPLE)


def draw_3d_text(
    base: Image.Image,
    x: int,
    y: int,
    text: str,
    font,
    fill: str,
    shadow: tuple[int, int, int, int],
    highlight: tuple[int, int, int, int],
    scale: int,
    depth: int = 4,
):
    layer = Image.new('RGBA', base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    bbox = draw.textbbox((0, 0), text, font=font)
    tx = scale_px(x, scale) - (bbox[2] - bbox[0]) / 2
    ty = scale_px(y, scale) - (bbox[3] - bbox[1]) / 2

    scaled_depth = max(1, scale_px(depth, scale))
    for offset in range(scaled_depth, 0, -1):
        draw.text((tx + offset, ty + offset), text, font=font, fill=shadow)
    highlight_offset = max(1, scale)
    draw.text((tx - highlight_offset, ty - highlight_offset), text, font=font, fill=highlight)
    draw.text((tx, ty), text, font=font, fill=fill)

    glow = layer.filter(ImageFilter.GaussianBlur(max(1, scale)))
    base.alpha_composite(glow)
    base.alpha_composite(layer)


def glow_text(base: Image.Image, x: int, y: int, text: str, font, fill: str, glow_rgba: tuple[int, int, int, int], scale: int, blur: int = 14):
    glow = Image.new('RGBA', base.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    bbox = glow_draw.textbbox((0, 0), text, font=font)
    tx = scale_px(x, scale) - (bbox[2] - bbox[0]) / 2
    ty = scale_px(y, scale) - (bbox[3] - bbox[1]) / 2
    glow_draw.text((tx, ty), text, font=font, fill=glow_rgba)
    glow = glow.filter(ImageFilter.GaussianBlur(scale_px(blur, scale)))
    base.alpha_composite(glow)
    ImageDraw.Draw(base).text((tx, ty), text, font=font, fill=fill)


def normalize_score(score: int) -> int:
    return score * 10 if score <= 10 else score


def display_score(score: int) -> str:
    normalized = normalize_score(score)
    if normalized % 10 == 0:
        return f'{normalized // 10}/10'
    return f'{normalized}/100'


def title_for(score: int) -> str:
    normalized = normalize_score(score)
    if normalized >= 95:
        return 'Cloud Quiz Champion'
    if normalized >= 85:
        return 'Rapyder Elite'
    if normalized >= 75:
        return 'Cloud Strategist'
    if normalized >= 65:
        return 'Data Runner'
    return 'Arcade Contender'


def render_template1(name: str, company: str, score: int, scale: int) -> Image.Image:
    base = load_template(str(TEMPLATE_1), scale).copy()
    overlay = Image.new('RGBA', base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    logo = rasterize_logo(374, scale)
    overlay.alpha_composite(logo, ((base.width - logo.width) // 2, scale_px(54, scale)))

    title = title_for(score)
    title_font = fit_text(draw, title, 'bold', 44, 24, 560, scale)
    draw_3d_text(overlay, 384, 380, title, title_font, '#DCE4EE', (62, 72, 88, 236), (255, 255, 255, 210), scale, depth=6)

    name_font = fit_text(draw, name.upper(), 'bold', 34, 20, 500, scale)
    draw_3d_text(overlay, 384, 876, name.upper(), name_font, '#E0E7F0', (64, 74, 90, 232), (255, 255, 255, 202), scale, depth=4)

    company_font = fit_text(draw, company.upper(), 'bold', 20, 14, 460, scale)
    draw_3d_text(overlay, 384, 937, company.upper(), company_font, '#C8D2DE', (56, 66, 82, 226), (250, 252, 255, 188), scale, depth=4)

    score_panel = Image.new('RGBA', base.size, (0, 0, 0, 0))
    panel_draw = ImageDraw.Draw(score_panel)
    panel_draw.rounded_rectangle(
        tuple(scale_px(value, scale) for value in (188, 992, 580, 1118)),
        radius=scale_px(60, scale),
        fill=(43, 43, 43, 224),
        outline=(91, 91, 91, 140),
        width=max(1, scale_px(2, scale)),
    )
    panel_draw.ellipse(
        tuple(scale_px(value, scale) for value in (230, 1026, 310, 1106)),
        outline=(255, 74, 74, 72),
        width=max(1, scale_px(10, scale)),
    )
    for index in range(28):
        start = index * 12
        panel_draw.arc(
            tuple(scale_px(value, scale) for value in (230, 1026, 310, 1106)),
            start=start,
            end=start + 7,
            fill=(252, 60, 60, 220),
            width=max(1, scale_px(5, scale)),
        )
    overlay.alpha_composite(score_panel.filter(ImageFilter.GaussianBlur(max(1, scale))))

    draw_3d_text(overlay, 404, 1022, 'SCORE', load_font('medium', scale_px(24, scale)), '#D4DDE8', (54, 64, 80, 228), (255, 255, 255, 176), scale, depth=3)
    glow_text(overlay, 410, 1064, display_score(score), load_font('bold', scale_px(54, scale)), '#FF564B', (255, 70, 70, 210), scale, blur=14)

    return Image.alpha_composite(base, overlay)


def render_template2(name: str, company: str, score: int, scale: int) -> Image.Image:
    base = load_template(str(TEMPLATE_2), scale).copy()
    overlay = Image.new('RGBA', base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    logo = rasterize_logo(374, scale)
    overlay.alpha_composite(logo, ((base.width - logo.width) // 2, scale_px(54, scale)))

    title = title_for(score).upper()
    title_font = fit_text(draw, title, 'bold', 30, 18, 420, scale)
    draw_3d_text(overlay, 384, 1208, title, title_font, '#FFD978', (90, 38, 0, 220), (255, 243, 190, 130), scale, depth=4)

    name_font = fit_text(draw, name.upper(), 'bold', 52, 28, 560, scale)
    draw_3d_text(overlay, 384, 700, name.upper(), name_font, '#FFD978', (90, 38, 0, 220), (255, 243, 190, 130), scale, depth=4)

    company_font = fit_text(draw, company.upper(), 'bold', 22, 12, 340, scale)
    draw_3d_text(overlay, 384, 802, company.upper(), company_font, '#FFD978', (90, 38, 0, 220), (255, 243, 190, 130), scale, depth=3)

    draw_3d_text(overlay, 384, 924, 'SCORE', load_font('bold', scale_px(24, scale)), '#F7EBC7', (40, 18, 0, 220), (255, 255, 255, 90), scale, depth=2)
    glow_text(overlay, 388, 1025, display_score(score), load_font('bold', scale_px(76, scale)), '#FFD76B', (255, 90, 50, 210), scale, blur=14)

    return Image.alpha_composite(base, overlay)


def prompt_if_missing(value: str | None, label: str) -> str:
    if value:
        return value.strip()
    return input(f'{label}: ').strip()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Generate Rapyder score cards from Template Card 1 or 2.')
    parser.add_argument('--template', choices=['1', '2'], help='Template variant to use')
    parser.add_argument('--name')
    parser.add_argument('--company')
    parser.add_argument('--score', type=int)
    parser.add_argument('--out')
    parser.add_argument('--scale', type=int, default=DEFAULT_SCALE, help='Output scale multiplier for HD export')
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    template = args.template or input('Template (1 or 2): ').strip() or '1'
    if template not in {'1', '2'}:
        raise SystemExit('Template must be 1 or 2')
    if args.scale < 1:
        raise SystemExit('Scale must be at least 1')

    name = prompt_if_missing(args.name, 'Name')
    company = prompt_if_missing(args.company, 'Company')
    score_value = args.score
    if score_value is None:
        score_value = int(input('Score (0-10 or 0-100): ').strip())
    score = max(0, min(score_value, 100))

    suffix = f'-{args.scale}x' if args.scale > 1 else ''
    default_out = PUBLIC / f"generated-score-card-template{template}-{slugify(name)}{suffix}.png"
    out_path = Path(args.out) if args.out else default_out
    if not out_path.is_absolute():
        out_path = BASE / out_path

    if template == '1':
        card = render_template1(name, company, score, args.scale)
    else:
        card = render_template2(name, company, score, args.scale)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    card.save(out_path, format='PNG', optimize=True)
    print(f'Generated {out_path}')
    print(f'Title: {title_for(score)}')
    print(f'Resolution: {card.width}x{card.height}')


if __name__ == '__main__':
    main()
