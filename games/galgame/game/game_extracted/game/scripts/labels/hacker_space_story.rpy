label hacker_space_tech_trivia:
    player "（也许我不会因此得奖，但这听起来很有趣！）"
    trivia_guy "很高兴你有兴趣！"
    trivia_guy "如果你全部答对，我有奖品给你。"
    trivia_guy "这次不能全部答对也别担心。"
    trivia_guy "我对这里的每个人都问同样八个问题，直到有人全部答对。"
    trivia_guy "你准备好了吗？"
    player "是的，开始吧！"

    call trivia_session from _call_trivia_session # see quiz_session.rpy
    # results has been checked
    return

label hacker_space_tech_talk:
    player @ surprised "看起来有人在做一个技术讲座！"
    player "听起来很酷！我们去听听。"
    play sound 'audio/sfx/applause.ogg'
    scene bg hacker_space with fadehold
    player "我只能理解部分内容，但很酷。"
    player "嗯，今天的技术讲座就到这里。"
    return

label hacker_space_project:
    player @ surprised "哇。到处都是白板和便利贴……"
    player "看起来人们在努力做他们的项目。"
    play sound 'audio/sfx/office_ambient.wav'
    player "我们不要打扰他们，远远地看着就好。"
    scene bg hacker_space with fadehold
    player "他们的应用想法真的很酷，即使目前还只是模型。"
    player "我想如果有一天我想开发自己的项目，这是一个不错的技能。"
    player "嗯，今天观察别人就到这里。"
    return

label hacker_space_open_source:
    player @ surprised "看起来有人在谈论他们的开源项目。"
    player "让我们听听他们要说什么。"
    show man purple
    male "为开源做贡献是练习技术技能和让简历更有吸引力的好方法。"
    player "（是吗？那为开源做贡献对我来说是个很棒的副项目。）"
    male "你可能想知道，在哪里能找到需要帮助的开源项目？嗯，它们几乎无处不在。"
    male "从这些网站开始看看吧！"
    scene bg hacker_space with fadehold
    player "嗯……这是一个有内容的讲座。也许我们应该付诸实践。"
    return

label hacker_space_playtest:
    show girl purple
    college_girl "嘿你好！"
    player @ surprised "嗯？我？"
    college_girl "是的。你有空吗？"
    college_girl "我们在为大学计算机科学课程做一个游戏项目，如果你愿意试玩测试，我们将非常感激。"
    college_girl "这是一个简单的乒乓球游戏，如果你想知道的话。"
    menu:
        "我们要试玩这个乒乓球游戏吗？"
    
        "好的！":
            window hide  # Hide the window and quick menu while in pong
            $ quick_menu = False
            # avoid rolling back and losing minigame state
            $ renpy.block_rollback()

            call screen pong

            # avoid rolling back and entering the chess game again
            $ renpy.block_rollback()
            # restore rollback from this point on
            $ renpy.checkpoint()
            $ quick_menu = True

            if _return == "computer":
                player "哇。电脑真的很厉害……"
                college_girl "耶！我感觉我们这个项目做得很好！"
                if not plot_lose_pong in persistent.achievements:
                    $ add_achievement(plot_lose_pong)
            else:
                player @ laugh "这是我的胜利！"
                college_girl "哇。恭喜！这场比赛很精彩。"
                if not plot_win_pong in persistent.achievements:
                    $ add_achievement(plot_win_pong)
                
            college_girl "感谢你抽出时间！"
            player "没问题。乐意帮忙！"

    
        "抱歉，我pass。":
            player @ neutral "抱歉，我对街机游戏不太感兴趣。祝你们的项目顺利！"
            college_girl "别担心，谢谢！"
    hide girl
    player "接下来是什么？我们去看看那边另一群人。"
    return
