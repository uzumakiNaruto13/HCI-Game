init python:
    def get_version():
        with renpy.open_file('version.txt') as f:
            version = f.read().strip()
        return version

label splashscreen:
    # check if new version is available on itch
    if not renpy.mobile:
        python:
            itch_butler_target = 'freecodecamp/learn-to-code-rpg'
            if renpy.linux:
                itch_butler_channel = 'linux'
            elif renpy.macintosh:
                itch_butler_channel = 'mac'
            elif renpy.windows:
                itch_butler_channel = 'win'

            local_version = None
            itch_version = None
            if requests is not None:
                try:
                    # query for version on itch
                    response = requests.get("https://itch.io/api/1/x/wharf/latest?target={}&channel_name={}".format(itch_butler_target, itch_butler_channel))
                    itch_version = response.json()['latest'].strip()
                    # compare with local version
                    local_version = get_version()

                except Exception: # no internet or web build
                    pass

        if local_version != itch_version:
            call screen confirm(
                _("我们在itch.io上发布了包含bug修复和功能增强的新版本。你想现在下载新版本吗？"),
                OpenURL(itch_url),
                Return()
                )

    scene gray90 with Pause(1)
    play sound 'audio/sfx/title_fire_swoosh.ogg'
    show learn_to_code_rpg_logo at truecenter with dissolve
    with Pause(2)
    scene gray90 with dissolve
    with Pause(1)

    scene gray90 with Pause(1)
    # play sound 'audio/sfx/title_fire_swoosh.ogg'
    show fcc_logo at truecenter with dissolve
    with Pause(2)
    scene gray90 with dissolve
    with Pause(1)

    # if not persistent.language_selected:
    #     scene black
    #     menu:
    #         "English":
    #             $renpy.change_language(None)
    #         "{font=fonts/simplified_chinese/NotoSansSC-Regular.otf}简体中文{/font}":
    #             $renpy.change_language("simplified_chinese")
    #     $ persistent.language_selected = True

    $ accessibility_tips = _p("""
        Accessibility Tips: To enable auto-voicing of the text, please first configure the speech synthesis settings (speaker gender, accent, etc.) on your computer according to {a=https://www.renpy.org/doc/html/self_voicing.html#speech-synthesis}these instructions{/a}.
        Back to the game, you may press the {b}{u}v{/u}{/b} key to switch on auto-voicing.

        Adjust the volume of music and sound effects on the Settings screen.

        Press the {b}{u}Esc{/u}{/b} key to access the Game Menu at any time during the game.
        """)
    # use a lighter background because the hyperlinks are dark blue
    scene main_menu overlay with dissolve
    pause 1
    show text "{size=48}[accessibility_tips!t]{/size}"
    with dissolve
    show screen ctc() # click to continue
    pause
    hide text with dissolve

    $ beta_disclaimer = _p("""
        This game, {b}Learn to Code RPG{/b}, is currently in beta. 

        The current version is v1.5. Save data from v1 might not be compatible with this version. Please start a new game instead of loading from your v1 data if applicable.

        If you notice any bugs or have suggestions about accessibility, the interface, the story, or anything at all, please report them on our {a=https://github.com/freeCodeCamp/LearnToCodeRPG}GitHub repo{/a}. Please always download the latest version of the game from {a=https://freecodecamp.itch.io/learn-to-code-rpg}itch.io{/a} as we continuously update the builds to address your feedback.

        If you are enjoying this game, please rate and review us on {a=https://freecodecamp.itch.io/learn-to-code-rpg}itch.io{/a} and star our {a=https://github.com/freeCodeCamp/LearnToCodeRPG}GitHub repo{/a}.
        """)
    # use a lighter background because the hyperlinks are dark blue
    show text "{size=48}[beta_disclaimer!t]{/size}"
    with dissolve 
    pause
    hide screen ctc
    hide text with dissolve

    # return control to the `start` label

    return