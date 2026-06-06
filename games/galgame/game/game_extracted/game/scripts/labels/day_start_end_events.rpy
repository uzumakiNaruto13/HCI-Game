label day_start:
    $ calendar.next()

    scene black
    play sound 'audio/sfx/alarm.wav'
    pause 2.0
    scene bg bedroom with eyeopen
    play sound 'audio/sfx/birds.wav'
    pause 3.0

    if is_in_v2_arc1 and not 'v2_running_late' in seen_v2_arc1_events[HOME] and renpy.random.random() < 0.2:
        $ seen_v2_arc1_events[HOME].add('v2_running_late')
        call v2_running_late from _call_v2_running_late

    else:
        # randomly choose a start-of-day label to call
        python:
            day_start_text = renpy.random.choice(seq=[
                'day_start_text1',
                'day_start_text2',
                'day_start_text3',
                ])
            renpy.call(day_start_text)
        
    return

label day_start_text1:
    player happy "新的一天！"
    show mint
    player "早上好Mint。"
    hide mint
    player neutral "今天不想吃大早餐，吃块饼干就好。"

    scene bg kitchen with blinds
    show cookie at truecenter
    pause 0.2
    play sound 'audio/sfx/chew_food.wav'
    player laugh "好吃好吃。"
    hide cookie

    scene bg bedroom with blinds
    player "妈妈的手工饼干总能完美开启早晨。"
    return

label day_start_text2:
    mom "[player_name]早餐好了！"
    player happy "好的起来了！"

    scene bg kitchen with blinds
    show toast at truecenter
    pause 0.2
    play sound 'audio/sfx/chew_food.wav'
    player laugh "好吃好吃。"
    hide toast
    player smile "吃完了去准备今天的事。"
    player "工作愉快！"
    dad "你也是[player_name]！"
    mom "回头见亲爱的！"
    
    scene bg bedroom with blinds
    player "一天最重要的一餐结束。"
    return

label day_start_text3:
    show mint
    player relieved "打呵欠……"
    player "（好想按掉闹钟……）"
    mint "喵！"
    player surprised "啊……Mint饿了吗？起来给你弄早餐。"

    scene bg bedroom with fadehold
    show mint
    play sound 'audio/sfx/chew_food.wav'
    pause 4.0
    hide mint

    player happy "哈哈Mint谢谢叫醒我。"
    player "开始今天吧。"
    return

label day_end:
    
    scene bg bedroom with blinds
    player relieved "呼……漫长的一天。"

    if renpy.random.random() < 0.2:
        # dinner scene
        mom "[player_name]晚饭好了！"
        player happy "来了妈妈！"

        scene bg kitchen night with blinds
        play sound 'audio/sfx/dining_ambient.wav'
        $ show_random_dinner_image()

        mom "今天怎样亲爱的？"
        player "好，好。"
        if day_activity == STUDY:
            player "今天学习了很多！"
        elif day_activity == BARISTA:
            player "在咖啡馆工作听到有趣谈话。"
        elif day_activity == HACKER_SPACE:
            player "去黑客空间看到做酷项目的人。"
        elif day_activity == PARK:
            player "在公园读好书很惬意。"
        elif day_activity == VIDEO_GAME:
            player "玩了些酷游戏希望有一天自己也能做。"
        elif day_activity == MUSIC:
            player "听了好音乐总能放松。"
        elif day_activity == JOB_SEARCH:
            player "今天在找工作希望简历能吸引招聘人员。"
        elif day_activity == INTERVIEW:
            player "今天面试不能说没压力但尽力了。"
        else:
            player "今天放松了一下。"
        dad "听起来今天很愉快。"
        mom "需要什么跟我们说。"
        player laugh "谢谢！你们最好了。"

    if has_met_layla and not has_triggered_ending_today and \
    not has_triggered_ending_tutor and \
    renpy.random.random() < 0.05:
        call ending_tutor from _call_ending_tutor

    scene bg bedroom with blinds
    player happy "一如既往的美味家常晚餐。"

    if has_met_layla and not has_triggered_ending_today and \
    not has_triggered_ending_office and \
    has_completed_curriculum and renpy.random.random() < 0.05:
        call ending_office from _call_ending_office

    if has_triggered_ending_today:
        jump day_end_sleep

    if not topics_to_ask and not day_activity == BARISTA:
        jump day_end_sleep

    # either has something to ask or has worked as a barista that day
    player smile "看看咖啡师班有听到需要研究的技术术语吗？"
    if not topics_to_ask:
        player "列表上没什么。"
        # TODO: hint at how to get those tech terms
    else: # if there are topics to ask about, call Annika or Marco
        player "确实有东西要问。"
        # randomly decide between Annika and Marco
        if not has_met_marco:
            player "现在给Annika打电话？"
            menu:            
                "现在打给Annika":
                    $ npc = annika
                    $ npc_sprite = 'annika'
                    call npc_conversation_start from _call_npc_conversation_start_2
            
                "先保存流行语":
                    player "先攒着等收集更多再问。"
        else:
            player "找谁聊？"
            menu:
                "找谁问技术流行语？"
            
                "Annika":
                    player "给Annika打电话。"
                    $ npc = annika
                    $ npc_sprite = 'annika'
                    call npc_conversation_start from _call_npc_conversation_start
            
                "Marco":
                    player "跟Marco聊聊。"
                    $ npc = marco
                    $ npc_sprite = 'marco'
                    call npc_conversation_start from _call_npc_conversation_start_1

                "先保存流行语":
                    player "先攒着等收集更多再问。"

label day_end_sleep:

    player "做了不少事该休息了。"
    player "明天又是新的一天对吧Mint？"
    show mint
    mint "喵！"
    player "哈哈晚安Mint。"
    hide mint

    scene black with eyeclose

    if has_met_layla and not has_triggered_ending_today and \
    not has_triggered_ending_cat and \
    renpy.random.random() < 0.05:
        call ending_cat from _call_ending_cat

    return # should return control to script.rpy

label day_end_interview:
    
    scene bg kitchen night with blinds
    play sound 'audio/sfx/dining_ambient.wav'
    $ show_random_dinner_image()

    mom "今天怎样亲爱的？面试如何？"
    player smile "不能说没压力但尽力了。"
    player "还需要更努力准备面试。"
    dad "就是这种精神。"
    mom "为你骄傲亲爱的。"
    dad "需要什么告诉我们。"
    player happy "谢谢知道你们支持我太好了！"
    dad "随时小南瓜。"

    scene bg bedroom with blinds
    player relieved "这一天等不及睡觉了……"
    play sound 'audio/sfx/social_media_notification.wav'
    show smartphone at truecenter
    player surprised "Annika发来短信。"
    hide smartphone
    show annika
    player "It reads {i}'Hope your interview went well & take some well-deserved rest & let me know if there's anything you need help with! <3'{/i}"
    hide annika
    player smile "哇Annika真好……"
    play sound 'audio/sfx/social_media_notification.wav'
    player surprised "哇Marco也发短信了？"
    show marco
    player "It reads {i}'Hey [player_name]! How did the interview go? Hopefully it wasn't too stressful for ya. Just keep in mind that we have all been there before. You can do it if you put in the work!{/i}"
    hide marco
    player happy "Marco真体贴……"
    show mint
    mint "喵喵~"
    player laugh "哇Mint你也来了？"
    hide mint
    player smile "有家人朋友和Mint支持太幸运了。"
    player relieved "就到这里迎接全新明天……"

    scene black with eyeclose

    return
