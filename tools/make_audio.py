"""Builds audio/01.mp3 ... audio/31.mp3 from the `say` lines in data.js using Microsoft's neural voices.
Run once after changing a line:  python -m pip install edge-tts   then   python tools/make_audio.py
Pick another voice with VOICE (see: python -m edge_tts --list-voices). The mp3 files are what the app plays."""
import asyncio, json, os, subprocess, sys
import edge_tts

VOICE = 'en-US-AndrewNeural'
CHEER_STYLE = dict(rate='+2%', pitch='+7Hz', volume='+8%')   # clip 30: brighter and a touch quicker, an encouragement rather than the storyteller
RATE = '-6%'      # a little slower than default, calmer storytelling pace
SLOWER = {24: '-12%', 25: '-10%', 29: '-12%'}   # the cross, the empty tomb and the final line are slower and weightier
HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(HERE)

data = json.loads(subprocess.check_output(
    ['node', '-e', "const d=require('./data.js');console.log(JSON.stringify({events:d.EVENTS,cheer:d.CHEER,outro:d.OUTRO}))"], cwd=APP))
events = data['events'] + [{'say': data['cheer']}, {'say': data['outro']}]   # clip 30 encourages after the last event; clip 31 is the line spoken when the journey ends

async def main():
    os.makedirs(os.path.join(APP, 'audio'), exist_ok=True)
    only = set(int(a) for a in sys.argv[1:])   # optional: python tools/make_audio.py 1 30 remakes only those clips
    for i, e in enumerate(events, 1):
        if only and i not in only:
            continue
        out = os.path.join(APP, 'audio', '%02d.mp3' % i)
        if not only and os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(os.path.join(APP, 'data.js')):
            continue   # already made from the current text
        for attempt in range(8):   # the free service occasionally returns nothing; try again
            try:
                await edge_tts.Communicate(e['say'], VOICE, **(CHEER_STYLE if i == 30 else dict(rate=SLOWER.get(i, RATE)))).save(out); break
            except edge_tts.exceptions.NoAudioReceived:
                await asyncio.sleep(2 * (attempt + 1))
        else:
            raise SystemExit('Line %d failed after 8 tries' % i)
        print(i, os.path.getsize(out), e['say'])

asyncio.run(main())
