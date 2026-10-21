from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN, MSO_AUTO_SIZE
from pptx.util import Inches, Pt


OUT = Path(__file__).resolve().parents[1] / "deliverables" / "新能源行业深度研究_2026-2031.pptx"
W, H = 13.333, 7.5
BG = "EDF5FA"
PAPER = "FFFFFF"
NAVY = "12304A"
INK = "18364D"
MUTED = "587184"
BLUE = "2F79A7"
CYAN = "79B9D7"
PALE = "DCECF5"
LINE = "C6D9E5"
GREEN = "2B816D"
AMBER = "C88732"
RED = "B95E5E"
FONT = "Microsoft YaHei"

prs = Presentation()
prs.slide_width = Inches(W)
prs.slide_height = Inches(H)
prs.core_properties.title = "中国新能源行业深度研究——反内卷出清、需求引擎切换与利润池迁移"
prs.core_properties.subject = "2026—2031 年中国新能源行业战略研判"
prs.core_properties.author = "基于用户提供的研究材料整理"
prs.core_properties.keywords = "新能源,储能,光伏,利润池,战略"


def rgb(value):
    return RGBColor.from_string(value)


def textbox(slide, x, y, w, h, text, size=14, color=INK, bold=False,
            align=PP_ALIGN.LEFT, valign=MSO_ANCHOR.TOP, margin=0.02,
            font=FONT, fit=False, italic=False):
    shape = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = shape.text_frame
    tf.clear()
    tf.word_wrap = True
    tf.margin_left = Inches(margin)
    tf.margin_right = Inches(margin)
    tf.margin_top = Inches(margin)
    tf.margin_bottom = Inches(margin)
    tf.vertical_anchor = valign
    if fit:
        tf.auto_size = MSO_AUTO_SIZE.TEXT_TO_FIT_SHAPE
    for i, line in enumerate(str(text).split("\n")):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = line
        p.alignment = align
        p.space_before = Pt(0)
        p.space_after = Pt(3 if len(str(text).split("\n")) > 1 else 0)
        p.font.name = font
        p.font.size = Pt(size)
        p.font.bold = bold
        p.font.italic = italic
        p.font.color.rgb = rgb(color)
    return shape


def rect(slide, x, y, w, h, fill=PAPER, line=None, radius=False):
    kind = MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE
    shape = slide.shapes.add_shape(kind, Inches(x), Inches(y), Inches(w), Inches(h))
    shape.fill.solid()
    shape.fill.fore_color.rgb = rgb(fill)
    if line:
        shape.line.color.rgb = rgb(line)
        shape.line.width = Pt(0.8)
    else:
        shape.line.fill.background()
    return shape


def rule(slide, x1, y1, x2, y2, color=LINE, width=1.0):
    shape = slide.shapes.add_connector(
        MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2)
    )
    shape.line.color.rgb = rgb(color)
    shape.line.width = Pt(width)
    return shape


def pill(slide, x, y, w, label, color=BLUE, fill=PALE, size=9):
    rect(slide, x, y, w, 0.27, fill=fill, radius=True)
    textbox(slide, x + 0.04, y + 0.015, w - 0.08, 0.22, label, size=size,
            color=color, bold=True, align=PP_ALIGN.CENTER, valign=MSO_ANCHOR.MIDDLE)


def card(slide, x, y, w, h, title, body="", accent=BLUE, title_size=15,
         body_size=11.5, fill=PAPER):
    rect(slide, x, y, w, h, fill=fill, line=LINE, radius=True)
    rect(slide, x, y, 0.055, h, fill=accent)
    textbox(slide, x + 0.20, y + 0.14, w - 0.36, 0.36, title, size=title_size,
            color=NAVY, bold=True)
    if body:
        textbox(slide, x + 0.20, y + 0.57, w - 0.38, h - 0.67, body,
                size=body_size, color=INK, fit=True)


def stat(slide, x, y, w, h, number, label, note="", accent=BLUE):
    rect(slide, x, y, w, h, fill=PAPER, line=LINE, radius=True)
    textbox(slide, x + 0.13, y + 0.12, w - 0.26, 0.48, number, size=25,
            color=accent, bold=True)
    textbox(slide, x + 0.13, y + 0.64, w - 0.26, 0.40, label, size=11.5,
            color=NAVY, bold=True)
    if note:
        textbox(slide, x + 0.13, y + 1.05, w - 0.26, h - 1.12, note,
                size=9.2, color=MUTED, fit=True)


def add_slide(title, section, source="", subtitle=None):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = rgb(BG)
    textbox(slide, 0.55, 0.22, 6.7, 0.22, "中国新能源行业深度研究  /  2026—2031",
            size=8.5, color=MUTED, bold=True)
    textbox(slide, 11.3, 0.22, 1.45, 0.22, section.upper(), size=8.2,
            color=BLUE, bold=True, align=PP_ALIGN.RIGHT)
    textbox(slide, 0.55, 0.57, 12.25, 0.60, title, size=25, color=NAVY, bold=True)
    if subtitle:
        textbox(slide, 0.58, 1.18, 12.1, 0.30, subtitle, size=11,
                color=MUTED)
    rule(slide, 0.55, 7.08, 12.78, 7.08, LINE, 0.8)
    textbox(slide, 0.57, 7.13, 10.9, 0.18,
            source if source else "资料口径：用户提供研究材料；预测及测算不代表已实现结果。",
            size=7.1, color=MUTED)
    textbox(slide, 12.0, 7.12, 0.75, 0.19, f"{len(prs.slides):02d}",
            size=8, color=MUTED, align=PP_ALIGN.RIGHT)
    return slide


def cell(slide, x, y, w, h, text, size=10, color=INK, bold=False,
         fill=PAPER, align=PP_ALIGN.LEFT):
    rect(slide, x, y, w, h, fill=fill, line=LINE)
    textbox(slide, x + 0.08, y + 0.035, w - 0.16, h - 0.07, text, size=size,
            color=color, bold=bold, align=align, valign=MSO_ANCHOR.MIDDLE, fit=True)


def add_bullet(slide, x, y, w, text, size=12, color=INK, accent=BLUE, h=0.52):
    rect(slide, x, y + 0.09, 0.07, 0.07, fill=accent, radius=True)
    textbox(slide, x + 0.18, y, w - 0.18, h, text, size=size, color=color, fit=True)


# 01 — Cover
s = prs.slides.add_slide(prs.slide_layouts[6])
s.background.fill.solid()
s.background.fill.fore_color.rgb = rgb(BG)
rect(s, 8.75, 0, W - 8.75, H, fill="E2F0F7")
rect(s, 9.50, 1.02, 2.95, 0.13, fill=BLUE)
textbox(s, 0.75, 0.58, 5.0, 0.30, "INDUSTRY STRATEGY  |  2026—2031", size=10,
        color=BLUE, bold=True)
textbox(s, 0.75, 1.45, 7.0, 1.22, "中国新能源行业\n深度研究", size=35,
        color=NAVY, bold=True)
textbox(s, 0.78, 3.08, 6.9, 0.80, "反内卷出清、需求引擎切换\n与利润池三类迁移",
        size=21, color=BLUE, bold=True)
rule(s, 0.78, 4.16, 5.95, 4.16, LINE, 1.2)
textbox(s, 0.78, 4.42, 6.65, 0.82,
        "核心判断  /  行业不是普涨反弹，而是供给出清、需求换挡与盈利分层同步发生。",
        size=15, color=INK)
textbox(s, 0.78, 6.55, 6.7, 0.32,
        "战略研讨版  ·  基于用户提供研究材料整理  ·  2026.10",
        size=9.5, color=MUTED)
for i, (big, small, c) in enumerate([
    ("出清", "供给曲线重塑", BLUE),
    ("换挡", "需求引擎迁移", GREEN),
    ("再分配", "利润池重估", NAVY),
]):
    yy = 1.65 + i * 1.52
    rect(s, 9.22, yy, 3.12, 1.12, fill=PAPER, line=LINE, radius=True)
    textbox(s, 9.48, yy + 0.15, 2.45, 0.42, big, size=24, color=c, bold=True)
    textbox(s, 9.49, yy + 0.67, 2.50, 0.24, small, size=10.5, color=MUTED)
textbox(s, 9.25, 6.67, 3.1, 0.20, "DECISION BRIEF  /  01", size=8.5,
        color=MUTED, bold=True)

# 02 — Executive answer
s = add_slide("核心结论：从“抄底行业”转向“押注结构性赢家”", "执行摘要",
              "来源：[1]—[7]、[18]、[25]、[31]—[33]；结论为基于源材料的战略归纳。")
card(s, 0.62, 1.55, 3.88, 2.08, "01 供给侧：出清尚未完成",
     "硅料库存、低开工率与亏损说明价格反弹不等于供需反转。2027 年能耗国标是潜在硬约束，真正信号是企业退出与集中度提升。", BLUE)
card(s, 4.72, 1.55, 3.88, 2.08, "02 需求侧：引擎正在切换",
     "国内光伏与乘用车增速承压；储能、出口、AI 电力提供增量，但商业模式兑现节奏、贸易壁垒和电力收益仍需逐项验证。", GREEN)
card(s, 8.82, 1.55, 3.88, 2.08, "03 利润池：向三类环节迁移",
     "价值流向高壁垒材料/设备、龙头技术与规模溢价，以及独立储能运营和海外 EPC 等新场景。中游制造整体反弹并非基准情景。", NAVY)
rect(s, 0.62, 3.92, 12.08, 1.17, fill=NAVY, radius=True)
textbox(s, 0.90, 4.12, 1.65, 0.28, "决策立场", size=11, color="B9D8E8", bold=True)
textbox(s, 2.35, 4.07, 9.95, 0.58,
        "先验证“出清 × 新需求 × 单位经济”，再配置产能、资本与组织资源；不以单一价格反弹作为下注依据。",
        size=19, color=PAPER, bold=True, valign=MSO_ANCHOR.MIDDLE)
add_bullet(s, 0.82, 5.45, 11.65, "未来 12—18 个月的关键分水岭：2026 全年光伏装机、储能出货增速、出口韧性，以及 2027 国标执行后的在产企业数。", size=13, h=0.5)
add_bullet(s, 0.82, 6.05, 11.65, "建议组合：以高壁垒环节作底仓逻辑，以独立储能/中东 EPC 作商业化验证，以技术路线升级作受控期权。", size=13, accent=GREEN, h=0.5)

# 03 — Thesis map
s = add_slide("三重变化叠加，决定行业从周期逻辑转入结构逻辑", "战略框架",
              "来源：[2]、[3]、[4]、[18]、[24]、[32]、[33]。")
stages = [
    ("供给出清", "反内卷 + 能耗约束", "低效产能退出\nCR5 集中度提升", BLUE),
    ("需求换挡", "光伏/车用增速回落", "储能 + 出口 + AI 电力\n补位但非等量替代", GREEN),
    ("利润再分配", "同质化环节承压", "高壁垒 + 龙头溢价\n运营与服务增值", NAVY),
]
for i, (head, sub, body, color) in enumerate(stages):
    x = 0.72 + i * 4.18
    rect(s, x, 1.75, 3.63, 2.23, fill=PAPER, line=LINE, radius=True)
    pill(s, x + 0.20, 1.97, 1.04, f"0{i+1}", color=color, fill=PALE, size=9)
    textbox(s, x + 0.20, 2.42, 3.15, 0.38, head, size=20, color=color, bold=True)
    textbox(s, x + 0.20, 2.91, 3.15, 0.35, sub, size=11, color=MUTED)
    rule(s, x + 0.20, 3.36, x + 3.35, 3.36, LINE, 0.9)
    textbox(s, x + 0.20, 3.48, 3.13, 0.38, body, size=11.5, color=INK, fit=True)
    if i < 2:
        textbox(s, x + 3.70, 2.62, 0.40, 0.45, "›", size=32,
                color=CYAN, bold=True, align=PP_ALIGN.CENTER)
rect(s, 0.72, 4.48, 11.98, 1.37, fill="E2F0F7", line=LINE, radius=True)
textbox(s, 1.00, 4.72, 1.55, 0.32, "战略含义", size=13, color=BLUE, bold=True)
textbox(s, 2.58, 4.65, 9.75, 0.64,
        "判断机会的单位从“行业赛道”缩小到“环节 × 商业模式 × 兑现信号”。\n没有集中度提升或单位经济改善，名义需求增长不自动转化为股东回报。",
        size=16, color=NAVY, bold=True)

# 04 — Evidence anchors
s = add_slide("六组关键证据：总量增速分化，盈利分化更剧烈", "关键数据",
              "来源：[1]—[7]、[10]、[13]、[15]、[18]；期间及口径见源材料。")
items = [
    ("317 GW", "2025 光伏新增并网", "2026H1 仅 71.77GW，-66% YoY", BLUE),
    ("630 GWh", "2025 储能锂电出货", "同比 +85%；2026Q1 +139%", GREEN),
    ("261.5 万辆", "2025 新能源车出口", "同比翻倍，出口成为重要对冲", NAVY),
    ("39.3%", "2025 硅料平均开工率", "有效产能约 350 万吨/年", AMBER),
    ("-74.4%", "大全能源 2026H1 毛利率", "与龙头/卡脖子环节显著分化", RED),
    ("33.6%", "天赐材料 2026H1 毛利率", "高壁垒材料盈利韧性较强", GREEN),
]
for i, it in enumerate(items):
    col, row = i % 3, i // 3
    stat(s, 0.67 + col * 4.13, 1.58 + row * 2.28, 3.82, 1.91, *it[:3], accent=it[3])
rect(s, 0.68, 6.25, 12.0, 0.47, fill="E2F0F7", radius=True)
textbox(s, 0.88, 6.34, 11.6, 0.25,
        "读数：行业“量”没有消失，但增长由国内装机/车用扩张转向储能、海外市场与特定高壁垒环节。",
        size=11.7, color=NAVY, bold=True)

# 05 — Market size and mix
s = add_slide("规模仍大，但新增产值测算不可误读为可比市场容量", "需求结构",
              "来源：[1]、[3]、[5]、[12]、[13]；3.53 万亿元为原材料粗算，存在环节口径重叠。")
textbox(s, 0.72, 1.55, 4.0, 0.36, "2025 主链新增产值粗算", size=14,
        color=NAVY, bold=True)
textbox(s, 0.72, 2.00, 4.0, 0.80, "≈ 3.53", size=40, color=BLUE, bold=True)
textbox(s, 3.05, 2.33, 1.3, 0.36, "万亿元", size=15, color=MUTED, bold=True)
textbox(s, 0.76, 2.95, 3.75, 0.85,
        "原文说明：采用当年新增量 × 参考均价；整车与电池/零部件存在重复统计，不能视为 GDP 贡献或互斥 TAM。",
        size=11.3, color=MUTED)
rule(s, 4.85, 1.70, 4.85, 5.95, LINE, 1.2)
textbox(s, 5.22, 1.55, 6.6, 0.36, "增长结构发生切换，而非简单消失", size=14,
        color=NAVY, bold=True)
mix = [
    ("传统引擎", "国内光伏新增并网", "317GW → H1 71.77GW（-66%）", RED),
    ("传统引擎", "国内新能源车销量", "H1 744.6 万辆；同比 +7.3%", AMBER),
    ("新增长线", "储能锂电出货", "2025 630GWh；Q1 215GWh", GREEN),
    ("新增长线", "海外需求/AI电力", "出口放量；算力用电上行", BLUE),
]
for i, (tag, label, data, c) in enumerate(mix):
    yy = 2.07 + i * 0.90
    pill(s, 5.25, yy + 0.03, 1.28, tag, color=c, fill="E7F0F5", size=8.5)
    textbox(s, 6.72, yy, 2.15, 0.30, label, size=11.3, color=NAVY, bold=True)
    textbox(s, 8.90, yy, 3.58, 0.32, data, size=11, color=INK)
    rule(s, 5.22, yy + 0.57, 12.45, yy + 0.57, LINE, 0.6)
rect(s, 0.73, 5.52, 11.99, 0.66, fill=NAVY, radius=True)
textbox(s, 0.96, 5.70, 11.5, 0.30,
        "决策提醒：容量增长必须经过“项目收益率 → 订单质量 → 利用率 → 现金回款”四步验证。",
        size=14, color=PAPER, bold=True)

# 06 — Demand engine transition
s = add_slide("两项传统需求降速，三条新引擎接棒但兑现有门槛", "需求结构",
              "来源：[2]—[6]、[14]、[16]、[31]、[40]—[41]。")
columns = [
    ("减速中的传统引擎", RED, [
        ("国内光伏", "2026H1 新增并网 71.77GW，-66% YoY"),
        ("国内车用", "2026H1 新能源车销量 +7.3%，渗透率约 49.6%"),
    ]),
    ("接力中的新增长线", GREEN, [
        ("独立储能", "出货高增；收入从配储转向能量/辅助服务/容量"),
        ("海外市场", "整车、电池和组件出口；需穿越关税与本地化"),
        ("AI 算力电力", "负荷增长带来绿电直供与储能需求"),
    ]),
]
for j, (head, c, rows) in enumerate(columns):
    x = 0.73 + j * 6.13
    rect(s, x, 1.65, 5.72, 3.93, fill=PAPER, line=LINE, radius=True)
    rect(s, x, 1.65, 5.72, 0.55, fill=c, radius=True)
    textbox(s, x + 0.18, 1.78, 5.30, 0.28, head, size=14, color=PAPER, bold=True)
    for i, (name, desc) in enumerate(rows):
        yy = 2.48 + i * (1.15 if j == 0 else 0.91)
        textbox(s, x + 0.23, yy, 1.45, 0.28, name, size=12.3, color=c, bold=True)
        textbox(s, x + 1.70, yy - 0.02, 3.68, 0.57, desc, size=11.2, color=INK, fit=True)
        if i < len(rows) - 1:
            rule(s, x + 0.22, yy + 0.67, x + 5.48, yy + 0.67, LINE, 0.7)
rect(s, 0.73, 5.87, 11.98, 0.64, fill="E2F0F7", radius=True)
textbox(s, 0.98, 6.04, 11.45, 0.28,
        "三条新线并非同质替代：储能靠可结算收益、出口靠本地化经营、AI 电力靠稳定负荷与电网接入。",
        size=13, color=NAVY, bold=True)

# 07 — Storage economics
s = add_slide("储能从“配储成本”转为“运营资产”，核心在收益堆叠", "商业模式",
              "来源：[3]、[4]、[31]；系统价格/成本为源材料测算口径。")
textbox(s, 0.72, 1.55, 5.55, 0.35, "系统集成：价格战压缩一次性毛利", size=14,
        color=NAVY, bold=True)
stat(s, 0.75, 2.05, 2.45, 1.62, "0.519", "元/Wh", "2026年8月 4h 系统最低中标价", BLUE)
stat(s, 3.43, 2.05, 2.45, 1.62, "0.51–0.55", "元/Wh", "源材料估算系统成本区间", AMBER)
textbox(s, 0.83, 3.95, 5.4, 0.62,
        "系统集成商单位毛利极薄；价值更取决于项目开发、并网交付、全生命周期运维与融资。",
        size=12, color=INK)
rule(s, 6.47, 1.65, 6.47, 5.98, LINE, 1.0)
textbox(s, 6.86, 1.55, 5.7, 0.35, "独立储能：三类收入决定 IRR", size=14,
        color=NAVY, bold=True)
rev = [
    ("电能量", "峰谷价差 / 现货套利", BLUE),
    ("辅助服务", "调频、备用等服务补偿", GREEN),
    ("容量机制", "容量电价 / 可用性补偿", NAVY),
]
for i, (name, desc, c) in enumerate(rev):
    yy = 2.12 + i * 0.92
    rect(s, 6.88, yy, 5.45, 0.68, fill=PAPER, line=LINE, radius=True)
    pill(s, 7.05, yy + 0.18, 1.42, name, color=c, fill=PALE, size=9)
    textbox(s, 8.72, yy + 0.17, 3.25, 0.29, desc, size=12, color=INK, bold=True)
    if i < 2:
        textbox(s, 9.34, yy + 0.68, 0.40, 0.20, "+", size=16, color=CYAN,
                bold=True, align=PP_ALIGN.CENTER)
rect(s, 6.87, 5.18, 5.48, 0.70, fill=NAVY, radius=True)
textbox(s, 7.05, 5.36, 5.12, 0.32,
        "投资门槛：逐项目验证收益可结算、利用小时、退化率与融资成本",
        size=11.5, color=PAPER, bold=True)

# 08 — Export and trade
s = add_slide("贸易壁垒升级，出海策略从“卖产品”转向“经营本地化”", "产业出海",
              "来源：[5]、[6]、[42]—[46]；政策状态以源材料及其引用时点为准。")
barriers = [
    ("美国", "301 关税 / PFE 约束\n清洁能源激励政策收紧", RED),
    ("欧盟", "电动车反补贴税\n价格承诺与本地规则", AMBER),
    ("印度", "ALMM 准入\n高关税与本地化要求", BLUE),
    ("土耳其", "组件本地化率要求\n风机核心部件国产化", NAVY),
]
for i, (country, desc, c) in enumerate(barriers):
    x = 0.73 + i * 3.05
    rect(s, x, 1.78, 2.72, 1.60, fill=PAPER, line=LINE, radius=True)
    textbox(s, x + 0.17, 1.96, 2.38, 0.34, country, size=18, color=c, bold=True)
    textbox(s, x + 0.17, 2.42, 2.39, 0.62, desc, size=11, color=INK, fit=True)
textbox(s, 0.77, 3.74, 3.3, 0.34, "企业应对：建立本地化经营能力栈", size=14,
        color=NAVY, bold=True)
steps = [
    ("产能", "本地/区域制造，降低边境摩擦"),
    ("技术", "授权、合资、客户联合开发"),
    ("资金", "本地融资、保险、汇率与回款管理"),
    ("组织", "合规、供应链、属地人才和售后"),
]
for i, (head, desc) in enumerate(steps):
    x = 0.76 + i * 3.04
    rect(s, x, 4.28, 2.72, 1.38, fill="E2F0F7", line=LINE, radius=True)
    pill(s, x + 0.15, 4.45, 0.88, head, color=BLUE, fill=PAPER, size=9)
    textbox(s, x + 0.16, 4.88, 2.39, 0.51, desc, size=10.7, color=INK, fit=True)
rect(s, 0.76, 5.99, 11.91, 0.53, fill=NAVY, radius=True)
textbox(s, 0.98, 6.12, 11.46, 0.25,
        "中东机会：需求与资本强，但项目筛选应先看付款保障、主权/业主信用、在地伙伴和 EPC 风险分配。",
        size=11.5, color=PAPER, bold=True)

# 09 — AI power
s = add_slide("AI 电力需求是增量期权，兑现取决于“负荷—电源—并网”协同", "新场景",
              "来源：[40]、[41]；中国算力中心 2030 用电预测在原文中存在较大口径差异。")
stat(s, 0.74, 1.78, 3.66, 1.70, "415 → 945", "全球数据中心用电（TWh）",
     "2024 实际至 2030 预测；IEA 口径", BLUE)
stat(s, 4.83, 1.78, 3.66, 1.70, "4,000–8,000", "中国算力中心用电（亿kWh）",
     "2030 多源预测区间，口径差异近一倍", GREEN)
rect(s, 8.92, 1.78, 3.66, 1.70, fill=NAVY, radius=True)
textbox(s, 9.16, 2.02, 3.18, 0.32, "战略判断", size=12, color="B9D8E8", bold=True)
textbox(s, 9.16, 2.43, 3.14, 0.70,
        "不是“AI=新能源订单”，而是具备可接入电力与可融资项目的区域更具优势。",
        size=14, color=PAPER, bold=True, fit=True)
textbox(s, 0.78, 3.95, 11.8, 0.34, "产业实践：四道门槛要同时闭环", size=14,
        color=NAVY, bold=True)
gates = [
    ("1", "稳定负荷", "负荷曲线、投产率、PUE"),
    ("2", "可靠电源", "绿电供给、储能调节、备用"),
    ("3", "并网资源", "接入容量、输电通道、审批"),
    ("4", "收益机制", "长期购电协议、价格传导、融资"),
]
for i, (num, head, body) in enumerate(gates):
    x = 0.78 + i * 3.02
    rect(s, x, 4.50, 2.67, 1.36, fill=PAPER, line=LINE, radius=True)
    textbox(s, x + 0.16, 4.65, 0.38, 0.43, num, size=20, color=BLUE, bold=True)
    textbox(s, x + 0.62, 4.66, 1.82, 0.27, head, size=13, color=NAVY, bold=True)
    textbox(s, x + 0.18, 5.16, 2.30, 0.46, body, size=10.5, color=MUTED, fit=True)
textbox(s, 0.80, 6.14, 11.70, 0.33,
        "优先验证：已签长期负荷/购电安排的项目，而不是仅以数据中心规划容量推算绿电需求。",
        size=12.2, color=BLUE, bold=True)

# 10 — Profit pools
s = add_slide("利润池从可复制制造环节流出，向壁垒、规模与运营迁移", "利润池",
              "来源：[7]、[18]、[22]、[23]；代表公司毛利率为源材料整理值。")
rect(s, 0.72, 1.68, 3.20, 3.85, fill="F8EEEE", line="E7CACA", radius=True)
pill(s, 0.95, 1.93, 1.13, "价值流出", color=RED, fill="F5DFDF")
textbox(s, 0.95, 2.42, 2.65, 0.44, "同质化中游制造", size=18, color=RED, bold=True)
textbox(s, 0.95, 3.05, 2.62, 1.68,
        "硅料 / 硅片\n二线组件 / 电芯\n低差异化整机\n\n扩产容易、议价弱、开工率敏感",
        size=12, color=INK, fit=True)
for i, (head, desc, c) in enumerate([
    ("高壁垒卡位", "隔膜、电解液、海缆；认证/工艺/设备壁垒带来稀缺收益。", BLUE),
    ("龙头规模与技术", "成本曲线、良率、客户与研发形成可兑现的领先。", NAVY),
    ("下游运营新场景", "储能运营、海外 EPC、充换电、绿电直供等以服务/资产获取收益。", GREEN),
]):
    yy = 1.71 + i * 1.34
    rect(s, 4.37, yy, 7.99, 1.09, fill=PAPER, line=LINE, radius=True)
    textbox(s, 4.61, yy + 0.16, 2.23, 0.33, head, size=15, color=c, bold=True)
    textbox(s, 6.89, yy + 0.17, 5.13, 0.58, desc, size=11.5, color=INK, fit=True)
    textbox(s, 3.91, yy + 0.24, 0.37, 0.40, "→", size=19, color=CYAN,
            bold=True, align=PP_ALIGN.CENTER)
rect(s, 4.38, 5.85, 7.98, 0.52, fill=NAVY, radius=True)
textbox(s, 4.60, 5.98, 7.50, 0.25,
        "筛选标准：壁垒可验证 × 单位经济为正 × 现金流可兑现",
        size=12.4, color=PAPER, bold=True)

# 11 — Margin dispersion
s = add_slide("毛利率横截面揭示结构分化：环节质量比总量更重要", "盈利质量",
              "来源：[7]；上市公司 2026H1 数据来自源材料所述同花顺财报库摘录，非独立核验。")
data = [
    ("天赐材料｜电解液", 33.6, GREEN),
    ("恩捷股份｜湿法隔膜", 29.9, GREEN),
    ("赛力斯｜高端整车", 29.1, BLUE),
    ("宁德时代｜电芯", 23.9, BLUE),
    ("东方电缆｜海缆", 22.1, BLUE),
    ("金风科技｜陆风整机", 16.8, NAVY),
    ("天合光能｜组件+储能", 7.6, AMBER),
    ("隆基绿能｜硅片+组件", 1.3, AMBER),
    ("TCL中环｜硅片", -9.7, RED),
    ("大全能源｜硅料", -74.4, RED),
]
chart_x, chart_y, chart_w = 4.30, 1.72, 7.90
scale = chart_w / 120
zero_x = chart_x + (75 * scale)
rule(s, zero_x, 1.64, zero_x, 6.46, NAVY, 1.0)
for i, (label, value, c) in enumerate(data):
    yy = 1.76 + i * 0.45
    textbox(s, 0.76, yy + 0.02, 3.32, 0.25, label, size=10.5, color=INK,
            bold=i in (0, 9))
    width = abs(value) * scale
    left = zero_x if value >= 0 else zero_x - width
    rect(s, left, yy + 0.05, width, 0.21, fill=c, radius=True)
    textbox(s, min(zero_x + width + 0.10, 11.75) if value >= 0 else max(left - 0.72, 3.45),
            yy + 0.01, 0.74, 0.26, f"{value:.1f}%", size=9.8, color=c, bold=True,
            align=PP_ALIGN.RIGHT if value < 0 else PP_ALIGN.LEFT)
textbox(s, 0.78, 6.42, 11.7, 0.28,
        "区间横跨 -74.4% 至 33.6%；毛利率不等于自由现金流或 ROIC，但足以显示议价权与产能利用率的巨大差异。",
        size=10.8, color=MUTED)

# 12 — Capacity and concentration
s = add_slide("中国产能份额已高，国内同质化扩产无法解决过剩", "竞争格局",
              "来源：[18]、[19]—[24]；CR5/CR3及全球份额均依源材料口径。")
textbox(s, 0.77, 1.55, 5.7, 0.34, "中国全球产能占比（2025 年末）", size=14,
        color=NAVY, bold=True)
shares = [("硅料", 96.0), ("硅片", 96.2), ("电池", 91.3), ("组件", 80.1)]
for i, (label, v) in enumerate(shares):
    yy = 2.09 + i * 0.73
    textbox(s, 0.83, yy, 0.80, 0.28, label, size=11.5, color=INK, bold=True)
    rect(s, 1.78, yy + 0.02, 3.74, 0.23, fill="D7E7EF", radius=True)
    rect(s, 1.78, yy + 0.02, 3.74 * v / 100, 0.23, fill=BLUE, radius=True)
    textbox(s, 5.64, yy - 0.02, 0.74, 0.28, f"{v:.1f}%", size=11, color=BLUE, bold=True)
rect(s, 0.82, 5.30, 5.58, 0.88, fill="E2F0F7", line=LINE, radius=True)
textbox(s, 1.02, 5.47, 5.15, 0.50,
        "结论：份额上限高、全球贸易壁垒上升；行业解法是退出、提效或本地化，不是继续堆国内名义产能。",
        size=11.4, color=NAVY, bold=True)
rule(s, 6.78, 1.62, 6.78, 6.20, LINE, 1.0)
textbox(s, 7.13, 1.55, 5.2, 0.34, "高集中度环节与仍待出清环节并存", size=14,
        color=NAVY, bold=True)
conc = [
    ("动力电池国内 CR5", "约 82%"),
    ("全球储能电芯 CR5", "约 72%"),
    ("国内风机整机 CR5", "约 73.4%"),
    ("海缆 CR3", "约 83.6%–87%"),
    ("硅料在产企业", "16 家 → H1 11 家"),
]
for i, (k, v) in enumerate(conc):
    yy = 2.08 + i * 0.71
    textbox(s, 7.18, yy, 2.83, 0.29, k, size=11.2, color=INK)
    textbox(s, 10.10, yy, 2.12, 0.29, v, size=12, color=BLUE, bold=True,
            align=PP_ALIGN.RIGHT)
    rule(s, 7.16, yy + 0.43, 12.28, yy + 0.43, LINE, 0.6)

# 13 — Policy double-edged sword
s = add_slide("政策组合一手压供给、一手压收益：不能把政策简单定性为利好", "政策机制",
              "来源：[29]—[39]；政策日期及条款应以正式文件原文为准。")
rect(s, 0.72, 1.68, 5.74, 3.91, fill=PAPER, line=LINE, radius=True)
rect(s, 6.85, 1.68, 5.74, 3.91, fill=PAPER, line=LINE, radius=True)
pill(s, 0.98, 1.93, 1.32, "供给侧", color=GREEN, fill="E3F1EC")
textbox(s, 0.98, 2.39, 4.98, 0.42, "反内卷 + 能耗国标", size=21, color=GREEN, bold=True)
textbox(s, 1.00, 3.00, 4.95, 1.47,
        "• 治理低于成本价竞争\n• 2027年能耗标准形成合规门槛\n• 预期：低效产能退出、集中度提高",
        size=13, color=INK, fit=True)
textbox(s, 1.00, 4.80, 4.95, 0.42, "受益：合规龙头 / 高效产能", size=12,
        color=GREEN, bold=True)
pill(s, 7.10, 1.93, 1.32, "需求侧", color=RED, fill="F5E7E7")
textbox(s, 7.10, 2.39, 4.98, 0.42, "136 号文 + 现货市场", size=21, color=RED, bold=True)
textbox(s, 7.12, 3.00, 4.95, 1.47,
        "• 新能源上网电量全面入市\n• 机制电价保量不保价\n• 预期：收益波动加大，项目 IRR 重估",
        size=13, color=INK, fit=True)
textbox(s, 7.12, 4.80, 4.95, 0.42, "受益：灵活性资产 / 交易能力", size=12,
        color=BLUE, bold=True)
rect(s, 0.73, 5.91, 11.86, 0.57, fill=NAVY, radius=True)
textbox(s, 0.97, 6.06, 11.4, 0.25,
        "核心权衡：制造端可能因出清获益；电站端需以区域电价、消纳、储能收益重新核算投资回报。",
        size=12.2, color=PAPER, bold=True)

# 14 — Technology roadmap
s = add_slide("技术迭代将呈现“主流路线稳态 + 细分路线分流”，不宜押单一颠覆", "技术路线",
              "来源：[19]、[34]、[47]—[49]；路线份额与商业化节点为源材料提供的判断。")
rule(s, 1.04, 2.05, 12.15, 2.05, BLUE, 2)
for x, year in [(1.15, "2026"), (5.08, "2027"), (9.27, "2028–2030"), (12.03, "2031+")]:
    rect(s, x, 1.91, 0.25, 0.25, fill=BLUE, radius=True)
    label_x = min(x - 0.18, W - 1.60)
    textbox(s, label_x, 1.53, 1.50, 0.25, year, size=11, color=BLUE, bold=True)
tracks = [
    ("光伏", "TOPCon 主流；BC 占比提升", "若 2027 成本追平则分流加速", "钙钛矿叠层进入商业化验证"),
    ("电池", "LFP 主导储能/中低端动力", "钠电、半固态小批量示范", "固态仍看成本、良率与规模"),
    ("风电", "陆风低价竞争缓和", "整机集中度与盈利修复", "海风/深远海项目放量窗口"),
]
for i, (name, a, b, c) in enumerate(tracks):
    yy = 2.42 + i * 1.08
    pill(s, 0.85, yy + 0.05, 0.90, name, color=BLUE, fill=PAPER, size=9)
    textbox(s, 2.03, yy, 2.88, 0.52, a, size=10.7, color=INK, fit=True)
    textbox(s, 5.13, yy, 3.16, 0.52, b, size=10.7, color=INK, fit=True)
    textbox(s, 9.30, yy, 2.80, 0.52, c, size=10.7, color=INK, fit=True)
    if i < 2:
        rule(s, 0.84, yy + 0.76, 12.2, yy + 0.76, LINE, 0.7)
textbox(s, 2.05, 5.93, 2.4, 0.25, "规模化现状", size=9.5, color=MUTED, bold=True)
textbox(s, 5.14, 5.93, 3.0, 0.25, "近端分流催化", size=9.5, color=MUTED, bold=True)
textbox(s, 9.31, 5.93, 2.8, 0.25, "远期产业化", size=9.5, color=MUTED, bold=True)

# 15 — Opportunity map
s = add_slide("四条结构性机会：以单位经济与兑现条件，而非主题热度筛选", "机会地图",
              "来源：[7]、[31]、[34]、[41]、[45]—[46]；机会判断为源材料归纳。")
opps = [
    ("A", "高壁垒环节", "湿法隔膜 / 电解液 / 海缆", "认证、工艺、产能利用率、客户集中度", "跟踪毛利率、扩产节奏、价格传导", BLUE),
    ("B", "独立储能运营", "电能量 + 辅助服务 + 容量机制", "可结算收入、利用小时、衰减与融资", "逐项目重建 8% IRR 假设，做压力测试", GREEN),
    ("C", "产能出海 / EPC", "中东、东南亚本地化交付", "本地资质、融资、回款、伙伴治理", "看订单质量与现金回款，不只看签约额", NAVY),
    ("D", "AI 电力一体化", "绿电 + 储能 + 数据中心", "负荷锁定、并网、长期购电协议", "优先看有真实负荷与电网接入的项目", AMBER),
]
for i, (tag, title, model, barrier, screen, c) in enumerate(opps):
    col, row = i % 2, i // 2
    x, y = 0.74 + col * 6.08, 1.62 + row * 2.27
    rect(s, x, y, 5.75, 1.94, fill=PAPER, line=LINE, radius=True)
    pill(s, x + 0.18, y + 0.16, 0.48, tag, color=c, fill=PALE, size=9)
    textbox(s, x + 0.83, y + 0.15, 4.50, 0.35, title, size=16, color=c, bold=True)
    textbox(s, x + 0.20, y + 0.62, 5.23, 0.27, model, size=11.5, color=NAVY, bold=True)
    textbox(s, x + 0.20, y + 1.00, 5.23, 0.28, "壁垒  " + barrier, size=9.8, color=INK, fit=True)
    textbox(s, x + 0.20, y + 1.39, 5.23, 0.31, "验证  " + screen, size=9.8, color=MUTED, fit=True)

# 16 — T1-T10 signal dashboard
s = add_slide("将观点转成可证伪仪表盘：十个信号覆盖供给、需求与盈利", "验证体系",
              "来源：源材料 T1–T10；阈值是研究假设，不是官方目标或投资建议。")
signals = [
    ("T1", "硅料现货 / 库存", "≥4万元/吨且 <40万吨", "<3.5万元/吨且 >50万吨", "周"),
    ("T2", "2026 光伏新增", ">200GW", "<150GW", "月/年"),
    ("T3", "储能季度出货增速", ">50% 持续", "<20%", "季"),
    ("T4", "碳酸锂主力月均", "≥12万元/吨", "<8万元/吨", "月"),
    ("T5", "H2 新能源出口同比", ">50%", "<20%", "月"),
    ("T6", "隔膜 / 海缆毛利", "恩捷>28%；东方>22%", "恩捷<25%；东方<20%", "季"),
    ("T7", "能耗国标后硅料企业", "<8 家", ">10 家", "季"),
    ("T8", "中东 EPC 季度新签", ">100亿元且份额>50%", "<50亿元且份额下滑", "季"),
    ("T9", "固态电池装车", "2027 百辆—千辆级", "无产线落地", "节点"),
    ("T10", "新能源+储能+数据中心", "GW级项目中标", "无项目招标", "节点"),
]
headers = [("信号", 0.74, 0.66), ("观测变量", 1.40, 2.70), ("偏强阈值", 4.14, 3.25),
           ("证伪/偏弱阈值", 7.43, 3.65), ("频率", 11.11, 1.20)]
for label, x, w in headers:
    cell(s, x, 1.57, w, 0.39, label, size=9.4, color=PAPER, bold=True,
         fill=NAVY, align=PP_ALIGN.CENTER)
for i, row in enumerate(signals):
    yy = 1.98 + i * 0.43
    values = [(row[0], 0.74, 0.66), (row[1], 1.40, 2.70), (row[2], 4.14, 3.25),
              (row[3], 7.43, 3.65), (row[4], 11.11, 1.20)]
    for j, (text, x, w) in enumerate(values):
        cell(s, x, yy, w, 0.41, text, size=8.6 if j > 0 else 9.1,
             color=BLUE if j == 0 else INK, bold=j == 0,
             fill=PAPER if i % 2 == 0 else "F6FAFC",
             align=PP_ALIGN.CENTER if j in (0, 4) else PP_ALIGN.LEFT)
textbox(s, 0.80, 6.48, 11.8, 0.25,
        "使用方式：月度更新原始数据 → 标注偏差与原因 → 触发投资/产能/项目闸门复核；不要把单个信号当作结论。",
        size=10.2, color=NAVY, bold=True)

# 17 — Scenarios
s = add_slide("中性情景仍是结构性机会，全面重估需出清与新需求同时兑现", "情景推演",
              "来源：源材料 4.6 节；预测为情景假设，不是事实预测或保证。")
scenario = [
    ("乐观", GREEN, "供给出清快；储能 2026>900GWh；出口>350万辆",
     "光伏回至 200GW+；储能 2027>1,200GWh",
     "龙头光伏毛利 10%–15%；行业估值切换",
     "T1 + T3 + T7 同时兑现"),
    ("基准", BLUE, "光伏 150–180GW；储能 +50%；反内卷温和推进",
     "风电约 130GW；储能约 900GWh；车销约 1,900万辆",
     "结构机会在储能/出海/高壁垒；中游继续磨底",
     "T2 150–180GW；T3>50%"),
    ("悲观", RED, "国标弱执行；组件<0.65元/W；出口受阻",
     "光伏<150GW；储能增速<20%",
     "亏损延续；龙头毛利压缩；资产负债表承压",
     "T2<150GW + T3<20% + T5<20%"),
]
labels = ["关键假设", "规模结果", "盈利 / 结论", "触发信号"]
for i, (name, c, a, b, d, e) in enumerate(scenario):
    x = 0.75 + i * 4.08
    rect(s, x, 1.65, 3.78, 4.85, fill=PAPER, line=LINE, radius=True)
    rect(s, x, 1.65, 3.78, 0.58, fill=c, radius=True)
    textbox(s, x + 0.20, 1.80, 3.35, 0.30, name + "情景", size=16,
            color=PAPER, bold=True)
    vals = [a, b, d, e]
    for j, (lab, val) in enumerate(zip(labels, vals)):
        yy = 2.49 + j * 0.92
        textbox(s, x + 0.19, yy, 3.36, 0.22, lab, size=9.3, color=c, bold=True)
        textbox(s, x + 0.19, yy + 0.28, 3.37, 0.48, val, size=10.2, color=INK, fit=True)
        if j < 3:
            rule(s, x + 0.19, yy + 0.81, x + 3.55, yy + 0.81, LINE, 0.6)
rect(s, 0.78, 6.62, 11.92, 0.24, fill="E2F0F7")
textbox(s, 0.96, 6.61, 11.54, 0.24,
        "决策含义：基准情景下重结构不重总量；只有供给出清、储能高增与政策约束共同验证，才讨论行业级估值重估。",
        size=10.2, color=NAVY, bold=True)

# 18 — Strategy posture
s = add_slide("资源配置建议：核心仓、验证仓与观察仓分层管理", "战略选择",
              "来源：基于源材料机会与风险的管理框架，不构成证券投资建议。")
tiers = [
    ("核心逻辑", "已有壁垒 / 盈利韧性", "卡脖子环节与头部平台", "看毛利质量、现金流、客户认证与扩产纪律", BLUE),
    ("验证逻辑", "新商业模式已出现但未普适", "独立储能、海外 EPC、AI 绿电", "小规模试点；以项目 IRR、回款、可结算收益设闸门", GREEN),
    ("观察逻辑", "产业化节点 / 政策兑现不确定", "BC/固态/钠电/钙钛矿等", "以成本曲线、良率、客户订单和量产里程碑验证", AMBER),
]
for i, (head, criterion, examples, control, c) in enumerate(tiers):
    yy = 1.68 + i * 1.42
    rect(s, 0.75, yy, 11.85, 1.14, fill=PAPER, line=LINE, radius=True)
    rect(s, 0.75, yy, 0.16, 1.14, fill=c)
    textbox(s, 1.03, yy + 0.17, 1.80, 0.31, head, size=15, color=c, bold=True)
    textbox(s, 3.03, yy + 0.13, 2.65, 0.31, criterion, size=11.2, color=NAVY, bold=True)
    textbox(s, 5.83, yy + 0.13, 2.66, 0.31, examples, size=11.1, color=INK)
    textbox(s, 3.03, yy + 0.57, 9.03, 0.34, "管理闸门  " + control, size=10.6, color=MUTED, fit=True)
rect(s, 0.77, 6.12, 11.83, 0.53, fill=NAVY, radius=True)
textbox(s, 0.97, 6.26, 11.43, 0.24,
        "原则：不因宏大叙事跳过订单质量、现金转换、资本开支回报与组织执行能力。",
        size=12, color=PAPER, bold=True)

# 19 — 90 day action plan
s = add_slide("90 天行动：先做验证体系，再做项目与组织卡位", "落地路线",
              "来源：源材料 5.6 节；项目筛选阈值需结合企业资本成本与风险偏好校准。")
work = [
    ("0–30 天", "建立事实底座", "统一 T1–T10 数据口径；盘点区域/客户/产能暴露；搭建利润池地图。",
     "输出：数据看板 + 业务暴露清单", BLUE),
    ("31–60 天", "验证单位经济", "对 2–3 个储能项目做完整收益堆叠与压力测试；访谈海缆/材料/中东 EPC 客户。",
     "输出：项目 IRR 模型 + 供应链尽调", GREEN),
    ("61–90 天", "形成资源决策", "筛选高壁垒合作方；确定本地化伙伴与风控条款；提交投资/产能/试点闸门。",
     "输出：三情景资源配置 + 试点决议", NAVY),
]
for i, (time, title, body, out, c) in enumerate(work):
    x = 0.77 + i * 4.08
    rect(s, x, 1.76, 3.78, 3.72, fill=PAPER, line=LINE, radius=True)
    pill(s, x + 0.18, 1.96, 1.16, time, color=c, fill=PALE, size=9)
    textbox(s, x + 0.19, 2.48, 3.33, 0.41, title, size=17, color=c, bold=True)
    textbox(s, x + 0.19, 3.04, 3.34, 1.12, body, size=11.1, color=INK, fit=True)
    rule(s, x + 0.18, 4.37, x + 3.58, 4.37, LINE, 0.7)
    textbox(s, x + 0.19, 4.59, 3.33, 0.54, out, size=10.4, color=NAVY, bold=True, fit=True)
    if i < 2:
        textbox(s, x + 3.82, 3.10, 0.24, 0.40, "›", size=24, color=CYAN,
                bold=True, align=PP_ALIGN.CENTER)
rect(s, 0.79, 5.90, 11.87, 0.65, fill="E2F0F7", line=LINE, radius=True)
textbox(s, 1.01, 6.07, 11.40, 0.31,
        "治理机制：业务负责人每月复盘信号；财务/战略共同复核单位经济；达到阈值才扩张，触发证伪条件即暂停。",
        size=11.8, color=NAVY, bold=True)

# 20 — Risks and close
s = add_slide("结论不是“行业全面反转”，而是以证据驱动的选择性卡位", "风险与结论",
              "风险提示基于源材料列示的七类风险；不构成投资、法律或其他专业建议。")
risks = [
    ("政策执行", "反内卷与能耗标准软化，出清延后", RED),
    ("需求兑现", "光伏<150GW；储能增速<20%", AMBER),
    ("贸易冲击", "出口增速回落、关税/本地化成本上升", RED),
    ("商品价格", "碳酸锂<8万元/吨，价格反弹被证伪", AMBER),
    ("技术路线", "BC成本未收敛，固态量产节点延期", BLUE),
    ("AI 用电", "算力负荷低于预期或并网受阻", BLUE),
]
for i, (head, desc, c) in enumerate(risks):
    col, row = i % 3, i // 3
    x, y = 0.76 + col * 4.05, 1.64 + row * 1.20
    card(s, x, y, 3.75, 0.98, head, desc, accent=c, title_size=12.5, body_size=9.3)
rect(s, 0.77, 4.33, 11.81, 1.15, fill=NAVY, radius=True)
textbox(s, 1.04, 4.55, 1.78, 0.27, "最终判断", size=12, color="B9D8E8", bold=True)
textbox(s, 2.80, 4.47, 9.42, 0.62,
        "2026—2027 是识别利润池迁移、等待供给约束验证的窗口；下注对象是壁垒、单位经济和执行能力，而非行业标签。",
        size=17, color=PAPER, bold=True, fit=True)
textbox(s, 0.84, 5.86, 11.62, 0.70,
        "重要提示：本材料根据用户提供的研究文本整理，部分经营数据为公司财报汇编或研究测算，预测与阈值可能存在时效性、口径及事实误差。仅供战略研讨参考，不构成投资建议、交易邀约或收益承诺；决策前应核验原始公告与适用政策文件。",
        size=9.7, color=MUTED, fit=True)

# 21–22 — Source register
sources_a = [
    ("[1]", "国家能源局｜2025 年全国电力工业统计数据"),
    ("[2]", "国家能源局｜2026H1 光伏新增并网"),
    ("[3]", "GGII（新浪财经转引）｜2025 中国储能锂电出货"),
    ("[4]", "GGII（中国电子报转引）｜2026Q1 储能锂电出货"),
    ("[5]", "中汽协（政府网转载）｜2025 新能源车销量与出口"),
    ("[6]", "乘联会｜2025 锂电池出口额"),
    ("[7]", "上市公司 2025 年报及 2026H1 财报（同花顺摘录）"),
    ("[8]", "BNEF｜全球光伏新增预测"),
    ("[9]", "GWEC｜全球风电新增装机"),
    ("[10]", "中国汽车动力电池产业创新联盟｜2025 装车量"),
    ("[11–12]", "CNESA｜全球及中国 2025 新型储能新增"),
    ("[13]", "工信部｜2026H1 锂电池产量"),
    ("[14–15]", "中汽协 / 电池联盟｜2026 年销量预测及动力电池装车"),
    ("[16–17]", "中国充电联盟 / 发改委等｜充电设施现状与目标"),
    ("[18]", "CPIA（新浪财经转引）｜硅料产能、开工率与企业数"),
    ("[19–20]", "CPIA 路线图 / 中信建投｜电池路线与组件份额"),
    ("[21–24]", "SNE / InfoLink / CWEA / 人民日报转引｜竞争格局与全球产能"),
    ("[25–28]", "财新 / 国家统计局 / TrendForce / 证券时报｜库存、价格与公司数据"),
]
s = add_slide("来源索引（1/2）：行业规模、需求与竞争", "来源附录",
              "完整标题、链接及免责声明见用户提供的源材料；此处为便于演示的简化索引。")
for i, (ref, name) in enumerate(sources_a):
    col, row = i // 9, i % 9
    x, y = 0.76 + col * 6.05, 1.55 + row * 0.55
    if i == 9:
        row = 0
        y = 1.55
    pill(s, x, y + 0.02, 0.72, ref, color=BLUE, fill=PAPER, size=8)
    textbox(s, x + 0.85, y, 4.90, 0.39, name, size=9.6, color=INK, fit=True)
    rule(s, x, y + 0.45, x + 5.77, y + 0.45, LINE, 0.5)

sources_b = [
    ("[29–30]", "六部门光伏产业座谈会 / 海风增值税即征即退"),
    ("[31–33]", "能源局储能行动方案 / 发改价格 136 号文 / 现货市场通知"),
    ("[34–39]", "十五五海风目标 / 中央经济工作会议 / 以旧换新 / 回收 / 双积分"),
    ("[40]", "人民日报海外版转引 IEA｜全球数据中心用电"),
    ("[41]", "人民日报转引信通院｜中国算力中心用电预测"),
    ("[42]", "欧委会｜对华电动车反补贴税与价格承诺"),
    ("[43–44]", "贸促会关税汇总 / SEC 文件｜美国贸易与税收政策"),
    ("[45–46]", "驻沙特使馆经商处 / 新浪财经｜中东装机与 EPC 订单"),
    ("[47–49]", "36 氪 / 中国科技网 / 中国经济网｜固态电池与钙钛矿进展"),
]
s = add_slide("来源索引（2/2）：政策、海外市场与技术路线", "来源附录",
              "完整 URL 与来源说明沿用用户附件；事实核查应回到各机构原始公告。")
for i, (ref, name) in enumerate(sources_b):
    yy = 1.62 + i * 0.52
    pill(s, 0.82, yy + 0.02, 0.84, ref, color=BLUE, fill=PAPER, size=8)
    textbox(s, 1.86, yy, 10.26, 0.34, name, size=11, color=INK, fit=True)
    rule(s, 0.82, yy + 0.43, 12.23, yy + 0.43, LINE, 0.6)
rect(s, 0.84, 6.48, 11.36, 0.31, fill="E2F0F7", radius=True)
textbox(s, 1.00, 6.51, 11.0, 0.23,
        "所有引用编号均对应原始材料参考文献；源材料含预测、二手转引及内部财报摘录，使用前请核验时点与口径。",
        size=9.1, color=NAVY, bold=True)


OUT.parent.mkdir(parents=True, exist_ok=True)
prs.save(OUT)
print(f"Created {OUT} ({len(prs.slides)} slides)")
