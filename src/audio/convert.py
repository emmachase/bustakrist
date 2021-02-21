input = """
Input #0, mp3, from 'NKTrapid.mp3':
  title           : Rapid
  artist          : NKT
Input #0, mp3, from 'ParadoxRoom.mp3':
  title           : Paradox Room
  artist          : YOSHI
Input #0, mp3, from 'burari-tokyo.mp3':
  title           : ぶらりTOKYO
  artist          : みやまなおすけ
Input #0, mp3, from 'chika-wakana.mp3':
  title           : 若菜
  artist          : ちか
Input #0, mp3, from 'gekikou.mp3':
  title           : 激昂
  artist          : 小林真澄
Input #0, mp3, from 'haritsumeru-kuuki.mp3':
  title           : はりつめる空気
  artist          : セントラルパーク吉田
Input #0, mp3, from 'hatsuyuki.mp3':
  title           : 初雪
  artist          : YOSHI
Input #0, mp3, from 'kaidou-no-kamisama.mp3':
  title           : 街道の神様
  artist          : おメガネ
Input #0, mp3, from 'pinpon-higashiyama-hakujitsuyume.mp3':
  title           : 白日夢
  artist          : ピンポン東山
Input #0, mp3, from 'quiet-spell.mp3':
  title           : Quiet spell
  artist          : 直行-NAOYUKI-
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
