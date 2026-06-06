label low_energy:
    $ renpy.notify(_('Your energy is dropping dangerously low. Why not take some time to relax and recharge?'))
    $ num_times_energy_low += 1

    if has_met_layla and not has_triggered_ending_farmer and \
    num_times_energy_low > 5 and renpy.random.random() < 0.05:
        call ending_farmer from _call_ending_farmer
    else:
        call day_activity_relax from _call_day_activity_relax

    call day_end from _call_day_end
    return

label day_activity_choices:
    $ day_activity = None
    $ has_triggered_ending_today = False
    # this label should end up jumping to day_end

    # if the player has low energy, jump directly to one of the relaxing choices
    if player_stats.is_energy_low():
        call low_energy from _call_low_energy
        return # return to script.rpy

    player smile "我们今天应该做什么？"
    menu:
        # this string goes from 'study CS fundamentals' to 'study more CS fundamentals'
        # when the player has completed the curriculum
        "学习计算机科学基础":
            # this choice helps grow coding knowledge
            python:
                day_activity = STUDY
                text = renpy.random.choice([
                    "让我们开始学习吧！",
                    "我们去[developerquiz]吧！",
                    "让我提升计算机科学知识吧！"
                    ])
                renpy.say(player, text)

            call study_session_choose_topic from _call_study_session_choose_topic_1
            call study_session from _call_study_session_1

            python:
                text = renpy.random.choice([
                    "我感觉刚刚做了一次很好的大脑体操……",
                    "有好多新信息要消化……",
                    "呼……希望以后我的大脑会感谢我这次的锻炼……"
                    ])
                renpy.say(player, text)

            $ player_stats.change_stats_random(ENERGY, -15, -10)

            if num_correct == 4:
                player @ laugh "我全部答对了！太棒了！"

                if not plot_quiz_all in persistent.achievements:
                    $ add_achievement(plot_quiz_all)

            elif num_correct == 3:
                player @ happy "但我答对了大部分！这样下去我能行！"
            elif num_correct == 2:
                player @ smile "我答对了一半。我需要更加努力。"
            elif num_correct == 1:
                player pout "……我只答对了一道题。"
                player neutral "嗯，总比什么都没有好。下次再努力！"
            elif num_correct == 0:
                player pout "……我全部答错了……"
                player neutral "但多练就会好起来的，不是吗？"

                if not plot_quiz_none in persistent.achievements:
                    $ add_achievement(plot_quiz_none)

        "做咖啡师的工作":
            # this choice unlocks interesting tech rumors and recovers a bit of energy
            $ day_activity = BARISTA
            player "我可以做些轮班来付账单。而且，我可以和人交流，暂时忘记死记硬背。"
            call day_activity_barista from _call_day_activity_barista

        "去黑客空间逛逛" if has_visited_hacker_space_with_annika:
            # this choice progresses the Hacker Space side story
            $ day_activity = HACKER_SPACE
            player "我很有冒险精神。为什么不去黑客空间看看，认识一些也在学编程的人呢？"
            call day_activity_hacker_space from _call_day_activity_hacker_space

        "休息一天放松一下":
            call day_activity_relax from _call_day_activity_relax_1

    call day_end from _call_day_end_1
    return

label study_session_choose_topic:
    # TODO: v2, show a different screen using checkboxes where you can mix-and-match any number of categories
    menu:
        player "我应该针对特定类别学习，还是混合所有类别？"

        "选择一个特定类别":
            menu:
                "通用计算机科学概念":
                    player "回顾计算机科学基础永远不是坏事！"
                    $ study_session_questions = general_cs_questions

                "HTML":
                    player "HTML（超文本标记语言）对网页开发很有用。我们就学这个吧！"
                    $ study_session_questions = html_questions

                "CSS":
                    player "CSS (Cascading Style Sheets) is useful for web development. Let's go with that!"
                    $ study_session_questions = css_questions

                "JavaScript":
                    player "JavaScript对网页开发和许多其他事情都很有用。我们就学这个吧！"
                    $ study_session_questions = javascript_questions

                "Python":
                    player "Python对数据科学和机器学习等很有用。我们就学这个吧！"
                    $ study_session_questions = python_questions

                "Linux":
                    player "Linux是一系列开源类Unix操作系统。它有一些每个酷开发者都应该知道的酷命令。我们就学这个吧！"
                    $ study_session_questions = linux_questions

                "Git":
                    player "Git是一个有用的版本控制系统。我们就学这个吧！"
                    $ study_session_questions = git_questions

                "SQL":
                    player "SQL（结构化查询语言）对数据库操作很有用。我们就学这个吧！"
                    $ study_session_questions = sql_questions

                "IT":
                    player "回顾IT（信息技术）基础永远不是坏事！"
                    $ study_session_questions = it_questions

        "混合所有类别":
            player "混合所有类别听起来很有趣。让我们百花齐放吧！"
            $ study_session_questions = persistent.all_quiz_questions

    return
            
label day_activity_relax:
    # this choice boosts energy
    player neutral "嗯……其实与其做什么，我觉得今天可以休息一下。"
    # if player_stats.is_energy_low():
    #     "(Whoa! {sc}Slow down, tiger.{/sc} We know you are excited about beefing up your {b}CS Knowledge{/b}, but it's important not to deplete your {b}Energy{/b}. Why not take some time to recharge?)"
    # player pout "……但我还有好多工作要做……"
    show mint
    mint "喵~"
    player smile "哦薄荷。你是想告诉我好好照顾自己吗？"
    player "哇谢谢薄荷。"
    hide mint
    player "好的。我们休息一天放松一下。做什么好呢？"
    menu day_activity_relax_choices:
        "在公园散步":
            $ day_activity = 'park'
            player "我们去公园吧。可惜我不能带薄荷出去散步。安妮卡有时带她的小狗去，他们都很喜欢。"
            call day_activity_park from _call_day_activity_park
        "玩电子游戏" if not renpy.mobile:
            $ day_activity = 'videogame'
            player "没有什么比电子游戏更棒了。"
            call day_activity_video_game from _call_day_activity_video_game
        "听音乐":
            $ day_activity = 'music'
            player "让我们听些音乐。"
            $ renpy.notify(_('There might be a lag before the selected track starts to play. Please be patient.'))
            call screen music_room_screen_in_script()
            if not plot_music_discover in persistent.achievements:
                $ add_achievement(plot_music_discover)

    $ player_stats.change_stats_random(ENERGY, 5, 20)
    # all relaxing activities converge to the end of the day
    return

label day_activity_hacker_space:
    scene bg hacker_space with blinds
    play sound 'audio/sfx/office_ambient.wav'
    player "（像往常一样这里有很多人。）"
    player "（我可以四处走走跟人聊聊看有什么酷事发生。）"

    # hacker space trivia
    if not has_won_hacker_space_trivia:
        show man
        trivia_guy "嘿那边的！想玩一轮技术问答吗？"
        menu:        
            "好呀~":
                call hacker_space_tech_trivia from _call_hacker_space_tech_trivia
            "抱歉，没心情。":
                player @ neutral "抱歉没心情。"
                trivia_guy "没问题。随时来找我挑战。"
                hide man
                player "（我们看看这里发生了什么事。）"
                call day_activity_hacker_space_random from _call_day_activity_hacker_space_random
    else:
        call day_activity_hacker_space_random from _call_day_activity_hacker_space_random_1

    scene bg hacker_space dusk with fadehold
    player @ surprised "哇，天已经黑了？今天真是多事的一天。"
    player "不知为何，在这种以程序员为中心的氛围中我感到相当放松。"
    # bump energy for a little bit
    $ player_stats.change_stats(ENERGY, 5)
    player "我们现在回家吧。"
    return

label day_activity_hacker_space_random:
    scene bg hacker_space with blinds
    if len(seen_hacker_space_events) == len(hacker_space_event_labels): # all seen, now pick random
        if not plot_hackerspace_all_events in persistent.achievements:
            $ add_achievement(plot_hackerspace_all_events)

        $ label = renpy.random.choice(hacker_space_event_labels)
    else: # just add the next one
        $ label = hacker_space_event_labels[len(seen_hacker_space_events)]
        $ seen_hacker_space_events.add(label)

    $ renpy.call(label)
    return

label day_activity_barista:
    scene bg cafe with blinds
    player "好了，让我们端上咖啡，帮助人们开始新的一天！"
    play sound 'audio/sfx/cafe_pour.wav'
    show coffee at truecenter
    pause 5
    hide coffee
    player "这是你的摩卡拿铁。祝你今天愉快！"
    # if all seen, skip
    if len(seen_barista_events) == len(barista_event_labels):
        player "（今天咖啡馆里很安静。看来听不到什么科技八卦了。）"
        if not plot_all_buzzwords in persistent.achievements:
            "（或者你已经收集了大部分科技流行语？）"
            $ add_achievement(plot_all_buzzwords)
    elif renpy.random.random() < 0.3: # even if not all labels are exhausted, still chance that nothing happens
        player "（今天咖啡馆里很安静。看来听不到什么科技八卦了。）"
    else:
        # 70% trigger rate, pick random tech gossip
        player @ surprised "（嘘……看起来有人在聚会聊天，很有趣。）"
        python:
            available_labels = list(set(barista_event_labels) - seen_barista_events)
            label = renpy.random.choice(available_labels)
            seen_barista_events.add(label)
            renpy.call(label)

    scene bg cafe dusk with fadehold
    play sound 'audio/sfx/cafe_pour.wav'
    show coffee at truecenter
    pause 5
    hide coffee

    player @ relieved "我的班快要结束了。"
    player "端咖啡可不是轻松的工作，但不知为何，与人打招呼让我感到精神焕发。"
    $ player_stats.change_stats(ENERGY, 5)

    if has_met_layla and not has_triggered_ending_barista and renpy.random.random() < 0.05:
        call ending_barista from _call_ending_barista
    return

label day_activity_park:
    scene bg park1 with blinds
    play sound 'audio/sfx/birds.wav'
    player happy "在公园散步总能舒缓我的神经。"
    scene bg park2 with fadehold
    pause 2.0
    scene bg park3 with fadehold
    pause 2.0
    scene bg park4 with fadehold
    pause 2.0
    play sound 'audio/sfx/birds.wav'
    scene bg park1 dusk with fadehold
    pause 2.0
    player "在大自然中放松时时间过得真快……我们现在回家吧。"
    if not plot_park in persistent.achievements:
        $ add_achievement(plot_park)

    return

label day_activity_video_game:
    player laugh "我最近买了大家都在谈论的那个节奏游戏。"
    player smile "我们从播放列表里选首歌吧。"
    
    # see rhythm_minigame.rpy    
    call rhythm_game_entry_label from _call_rhythm_game_entry_label

    player laugh "真好玩！"
    player smile "电子游戏是减压的最好方式，不是吗？"
    player "现在我感觉完全放松了，为明天的战斗充满能量！"
    return

label day_activity_job_search:
    $ day_activity = 'jobsearch'
    if has_won_hacker_space_trivia and not has_applied_to_cupcakecpu:
        player "说到招聘信息，我想起来黑客空间的问答大叔给了我一张名片。"
        show business_card at truecenter with zoomin
        player "这是名片。来自CupcakeCPU。"
        player "我们来申请CupcakeCPU吧。"
        hide business_card

        $ company_name = 'CupcakeCPU'
        # choose 3 skills, sampling w/o replacement
        $ company_required_skills = random.sample(sorted(v1_skills), 3)

        call screen job_posting_screen(company_name, company_required_skills)
        $ has_applied = _return

        if has_applied:
            $ has_applied_to_cupcakecpu = True
            # guaranteed interview
            $ interview_company_name = company_name # a guaranteed interview

            # set up interview questions
            python:
                quiz_session_questions = []
                for skill in company_required_skills:
                    quiz_session_questions.extend(all_questions_map[skill])

            $ add_achievement(plot_cupcakecpu)

    else:
        "（面试难？确保每个公司要求技能的状态值高于[cs_knowledge_threshold]。）"
        # apply to some random company
        $ company_name = renpy.random.choice(list(all_company_names.keys()))

        # choose 3 skills, sampling w/o replacement
        $ company_required_skills = random.sample(sorted(v1_skills), 3)

        $ easter_egg_skill = None
        if renpy.random.random() < 0.05: # 5% chance of getting Easter Egg
            $ easter_egg_skill = renpy.random.choice(easter_egg_skills)

        call screen job_posting_screen(company_name, company_required_skills, easter_egg_skill=easter_egg_skill)
        $ has_applied = _return
        if has_applied:
            python:
                meets_criteria = True
                for skill in company_required_skills:
                    if player_stats.subcategory_stats_map[skill] < cs_knowledge_threshold:
                        meets_criteria &= False
                    else:
                        meets_criteria &= True
            if meets_criteria or renpy.random.random() < 0.2: # even if criteria not met, 20% chance of getting interview
                $ interview_company_name = company_name

                # set up interview questions
                python:
                    quiz_session_questions = []
                    for skill in company_required_skills:
                        quiz_session_questions.extend(all_questions_map[skill])

    if has_applied:
        $ num_jobs_applied += 1
        player @ smile "申请已提交。希望一切顺利。"
    else:
        player @ pout "我觉得我还没准备好这份工作。他们要求的很多技能我还没有。"
        player "我们继续找。"

    if has_won_hacker_space_trivia:
        $ todo_list.complete_todo(todo_apply_cupcakecpu)

    return

label day_activity_interview:
    # this doesn't call `day_start` in advance
    # so we need to manually increment the calendar day here
    $ calendar.next()

    $ day_activity = 'interview'

    scene black
    play sound 'audio/sfx/alarm.wav'
    pause 2.0
    scene bg bedroom with eyeopen
    play sound 'audio/sfx/birds.wav'
    pause 3.0

    player smile "今天是我的大日子！我要去{b}[interview_company_name]{/b}面试。"    

    $ interview_room_bg = renpy.random.choice([
        'bg interview_room1',
        'bg interview_room2',
        'bg interview_room3'
        ])
    $ renpy.scene()
    $ renpy.show(interview_room_bg)
    with blinds
    # the above is equivalent to the below show statement
    # scene interview_room_bg with blinds
    player surprised "哇。他们的办公室真豪华。希望我也能在这样豪华的办公室里有一个格子间……"

    $ interviewer_sprite = renpy.random.choice([
        'man',
        'woman',
        ]) + ' ' + renpy.random.choice(['', 'red', 'orange', 'blue', 'purple'])
    $ renpy.show(interviewer_sprite)
    interviewer "你好，是[player_name]吗？"
    player smile "是的。早上好。"

    interviewer "很高兴认识你！我们很高兴你申请了我们的职位。"
    interviewer "好的，既然我们都在这里，我们开始面试吧。"
    player "听起来不错！"
    call interview_session from _call_interview_session

    interviewer "感谢你抽出时间。我们会联系你告知下一步。"
    $ renpy.hide(interviewer_sprite)

    player relieved "（……就这样吗？能撑过去真不容易……）"
    $ player_stats.change_stats_random(ENERGY, -10, -5)
    player "和我想象的一样紧张。希望我的准备做得不错。"
    player "我等不及回家然后放松了……"
    return

# v2 day activities
label v2_activity_choices:
    if player_stats.is_energy_low():
        call low_energy from _call_low_energy_1
        return # return to script.rpy

    player smile "现在我终于有一些空闲时间了。我该做什么？"
    menu:
        "处理一些工单":
            call work_session from _call_work_session
    
        "去黑客空间逛逛":
            call v2_activity_hacker_space from _call_v2_activity_hacker_space

        "休息一天放松一下":
            call day_activity_relax from _call_day_activity_relax_2

        "去购物":
            call screen shop_screen(home_shop_items)
            
    call day_end from _call_day_end_2
    return

label v2_activity_hacker_space:
    scene bg hacker_space with blinds
    play sound 'audio/sfx/office_ambient.wav'

    if len(v2_arc1_event_labels[HACKER_SPACE]) == len(seen_v2_arc1_events[HACKER_SPACE]) or \
    renpy.random.random() < 0.6:
        call day_activity_hacker_space_random from _call_day_activity_hacker_space_random_2
    else: # 40% chance of triggering an event
        python:
            available_labels = list(set(v2_arc1_event_labels[HACKER_SPACE]) - seen_v2_arc1_events[HACKER_SPACE])
            label = renpy.random.choice(available_labels)
            seen_v2_arc1_events[HACKER_SPACE].add(label)
            renpy.call(label)

    return

label v2_vending_machine:
    "你想去自动售货机吗？"
    menu:
        "是":
            call screen shop_screen(vending_machine_items)
    
        "下次再说":
            pass

    return
    
label v2_shop:
    "你想去购物吗？"
    menu:
        "是":
            call screen shop_screen(home_shop_items)
    
        "下次再说":
            pass

    return

label v2_routine:
    # check if it's a weekday or weekend
    if calendar.is_weekday():
        # go to work
        scene bg company1_center with fadehold
        play sound 'audio/sfx/office_ambient.wav'
        # TODO: maybe give player the choice to visit the vending machine both before and after work?

        player "好的。我们去我的座位吧。"
        scene bg company1_lydia_cubicle with blinds
        call work_session from _call_work_session_1

        # after work
        scene bg company1_center with dissolve
        play sound 'audio/sfx/office_ambient.wav'

        # after work, trigger random work events, if no events, give player the choice to visit the vending machine
        if len(v2_arc1_event_labels[WORK]) == len(seen_v2_arc1_events[WORK]) or \
        renpy.random.random() < 0.8:
            call v2_vending_machine from _call_v2_vending_machine
        else: # trigger work event
            python:
                available_labels = list(set(v2_arc1_event_labels[WORK]) - seen_v2_arc1_events[WORK])
                label = renpy.random.choice(available_labels)
                seen_v2_arc1_events[WORK].add(label)
                renpy.call(label)

        # go home
        scene bg living_room night with blinds
        # trigger random home events, if no events, do routine
        if len(v2_arc1_event_labels[HOME]) == len(seen_v2_arc1_events[HOME]) or \
        renpy.random.random() < 0.8:
            player smile "终于到家了！我准备吃晚饭了！"

            if renpy.random.random() < 0.2:
                # dinner scene
                scene bg kitchen night with blinds
                play sound 'audio/sfx/dining_ambient.wav'
                $ show_random_dinner_image()
                player "今天工作中发生了这样的事……"
                mom "哈哈哈那很有趣。"
                dad "你的同事们确实个性很独特。"
                player "我打赌是的！"

            scene bg bedroom with blinds
            player "晚饭确实很有趣。"
            call v2_activity_choices from _call_v2_activity_choices

        else: # trigger home event
            python:
                available_labels = list(set(v2_arc1_event_labels[HOME]) - seen_v2_arc1_events[HOME])
                label = renpy.random.choice(available_labels)
                seen_v2_arc1_events[HOME].add(label)
                renpy.call(label)

    else:
        # weekend, stay home
        call v2_activity_choices from _call_v2_activity_choices_1
    return