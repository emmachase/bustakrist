input = """
Input #0, mp3, from 'akai-tsuchi-wo-funde.mp3':
    title           : 紅い土を踏んで
    artist          : カモキング
Input #0, mp3, from 'asu-wo-matte.mp3':
    title           : 明日を待って
    artist          : 守已
Input #0, mp3, from 'bikou-seyo.mp3':
    title           : 尾行せよ
    artist          : 衛門幸志
Input #0, mp3, from 'blue-moon.mp3':
    title           : blue moon
    artist          : Akiko Shioyama
Input #0, mp3, from 'burari-tokyo.mp3':
    title           : ぶらりTOKYO
    artist          : みやまなおすけ
Input #0, mp3, from 'cluster-shoujo.mp3':
    title           : クラスター少女
    artist          : ピンポン東山
Input #0, mp3, from 'gekikou.mp3':
    title           : 激昂
    artist          : 小林真澄
Input #0, mp3, from 'hakujitsumu.mp3':
    title           : 白日夢
    artist          : ピンポン東山
Input #0, mp3, from 'haritsumeru-kuuki.mp3':
    title           : はりつめる空気
    artist          : セントラルパーク吉田
Input #0, mp3, from 'hatsuyuki.mp3':
    title           : 初雪
    artist          : YOSHI
Input #0, mp3, from 'ichizu.mp3':
    title           : 一途
    artist          : 高橋岳
Input #0, mp3, from 'kagayakeru-hitotoki.mp3':
    title           : 輝けるひととき
    artist          : TSUTOMU
Input #0, mp3, from 'kaidou-no-kamisama.mp3':
    title           : 街道の神様
    artist          : おメガネ
Input #0, mp3, from 'maniawanakunattemo-shiranzo.mp3':
    title           : 間に合わなくなってもしらんぞ！？
    artist          : おメガネ
Input #0, mp3, from 'nadenade.mp3':
    title           : なでなで
    artist          : 高橋岳
Input #0, mp3, from 'obscured.mp3':
    title           : Obscured
    artist          : TOMO
Input #0, mp3, from 'okurimono.mp3':
    title           : 贈り物
    artist          : TSUTOMU
Input #0, mp3, from 'paradox-room.mp3':
    title           : Paradox Room
    artist          : YOSHI
Input #0, mp3, from 'quiet-spell.mp3':
    title           : Quiet spell
    artist          : 直行-NAOYUKI-
Input #0, mp3, from 'rapid.mp3':
    artist          : NKT
    title           : rapid
Input #0, mp3, from 'subarashii-nichijou.mp3':
    title           : 素晴らしい日常
    artist          : TSUTOMU
Input #0, mp3, from 'wakana.mp3':
    title           : 若菜
    artist          : ちか
Input #0, mp3, from 'why.mp3':
    title           : Why
    artist          : 直行-NAOYUKI-
Input #0, mp3, from 'yakousei-no-utage.mp3':
    title           : 夜行性の宴
    artist          : カモキング
Input #0, mp3, from 'yokan.mp3':
    title           : 予感
    artist          : aki
"""

import re

blocks = re.findall(r"Input [\s\S]+?(?=Input|$)", input)
for block in blocks:
  filename = re.search(r"from '([\s\S]+?)':(?:\n|$)", block).group(1)
  artist = re.search(r"artist\s*:\s*([\s\S]+?)(?:\n|$)", block).group(1)
  title = re.search(r"title\s*:\s*([\s\S]+?)(?:\n|$)", block).group(1)
  print(("""  {{
    "filename": "{}",
    "artist": "{}",
    "title": "{}"
  }},""").format(filename, artist, title))

# for block in input:gmatch("Input .+[^:]\n") do
#   print("B", block)
# end
