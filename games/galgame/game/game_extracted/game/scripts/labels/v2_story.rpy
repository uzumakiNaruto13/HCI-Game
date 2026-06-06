label v2_working_late:
    show oliver
    oliver @ smile "[player_name]！你下班前我赶上你了吗？"
    player smile "没有还没下班呢！需要帮忙吗？"
    oliver "你知道那个新客户Stacy&Lucy's吗？"
    player "知道——婚纱连锁店？"
    oliver "就是那家！刚和他们通完电话，他们想知道你和团队能不能提前完成？"
    player surprised "提前？"
    player worry "我是说——"
    player "他们怎么想的？我们计划下周完成。"
    oliver @ neutral "所以"
    oliver "这可能听起来有点疯狂——"
    oliver "——他们的电商系统需要在两天内完成。"
    player surprised "两……两天？"
    oliver "是啊他们在电话里很坚持。只剩用户认证了，你觉得能搞定吗？"
    player pout "嗯……"

    menu:
        "我确定这需要两天以上。":
            player "我不确定这能做到Oliver。我们还有其他项目要按时完成。"
            oliver "我完全理解。只是Brian说他们只需要完成某种认证设置，应该不超过两天对吧？"
            player neutral "我是说……他们要定制还是用Auth0这样的现有服务？"
            oliver "我看看笔记……嗯——他们要定制的。但我们以前做过类似的吧？"
            oliver "去年Brian三天就搞定了类似的东西，你加把劲也能做到！"
            player "嗯……"

            menu:
                "（我还是不确定，应该跟客户多沟通。）":
                    player "能告诉客户定制认证的利弊吗？不应该不沟通就答应。"
                    oliver "早上跟他们打了一小时电话，他们不会让步的。"
                    oliver "加把劲也许能完成？我这周都在加班——如果你和团队也加班肯定能按时完成！"
                    oliver "按时完成的话我还能在Iris面前美言你，她肯定喜欢你带团队渡过难关让客户满意。"

                    menu:
                        "我觉得需要先和Goro商量。":
                            player "我们需要先和Goro商量，他是团队领导最了解我们的承诺情况。"

                            show goro at left with moveinleft
                            goro @ smile "Goro最擅长什么？"
                            oliver "Goro！正要找你！"
                            "你退到一边让他们两人交谈，仔细听着。"
                            "Goro主动提出和Oliver一起打电话给客户，从技术角度给出更现实的时间线和解决方案。"
                            "两人谈完后约了明天早上和客户开会。Oliver很满意这个结果，高兴地道别了。"
                            player smile "谢谢帮忙Goro！我不知道那种情况怎么做才对。"
                            goro "别担心你做得很对。最好不要在开发项目上做瞬间决定，尤其是有其他客户在排队、决定会影响整个团队的时候。"
                            goro "不确定的时候就应该像这样找高级开发者寻求第二意见。"
                            player "谢谢！我会记住的。"
                            "你因负责任的决定获得了20声望。"
                            $ player_stats.change_stats(RENOWN, 20)

                        "也许可以加会儿班，好吧。":
                            call v2_working_late_sad_path from _call_v2_working_late_sad_path

                "（我只是做得慢吗？Brian当时能做到我也可以！我能行。）":
                    call v2_working_late_sad_path from _call_v2_working_late_sad_path_1

        "当然，我对工作越来越熟悉了！应该能搞定。":
            call v2_working_late_sad_path from _call_v2_working_late_sad_path_2
    return

label v2_working_late_sad_path:
    oliver @ laugh "就是这种精神！你是好开发者，肯定能很快完成！"
    player laugh "是啊！不会那么难吧？"
    oliver @ smile "有问题随时找我，我会把项目信息发给你。"
    "你坐到桌前查看项目的JIRA日志，一切如Oliver所说。"
    "突然Oliver发来变更工单号，打开后你突然失去信心。"
    "你要了Oliver说的Brian几年前完成的认证工单，没用——代码里几乎没有注释。"
    "即使有注释，项目用的是你还不懂的不同语言和框架。"
    player worry "天哪……两天怎么完成？仔细想想我对构建定制认证系统一无所知。"
    "第一天几乎全花在看视频和StackOverflow帖子上，连从哪开始都不知道。"
    "每个论坛的评论都互相矛盾，各说各的认证系统写法最好。"
    "抬头看钟已经下午6点，精疲力竭决定休息一下。"

    show goro with moveinleft
    goro "[player_name]？你在这做什么？6点了该收拾了。"
    player pout "嗨Goro，不行——我答应了要按时完成Stacy&Lucy's的项目。"
    goro "但那个是一周后截止？"
    player "嗯自从跟Oliver谈过后就不是了，他说S&L坚持要两天内完成。"
    goro "两天？[player_name]我觉得不可能。"
    player neutral "我现在也意识到了……但已经答应了怎么办？"
    goro neutral "我会跟Oliver谈。大概我会和他一起打电话给客户，解释无法在这么短时间内完成。"
    goro "如果他们要两天内完成，我们就得偷工减料，他们需要明白这一点。"
    player "会拼啦。"
    goro "下次有大的承诺变更时请找我。"
    goro "这个决定不只影响你，还影响整个团队和排在前面的客户项目。"
    goro "如果把所有时间和资源投入一个账户而不开会安排，等更久的客户项目就会延期。"
    player "抱歉我没考虑到这个。"
    goro smile "没关系。现在先回家吧，明天继续做本周排好的任务。"
    "因没和团队领导商量决定失去10声望，因7小时压力搜索失去15精力。"
    $ player_stats.change_stats(RENOWN, -10)
    $ player_stats.change_stats(ENERGY, -15)
    return

label v2_help_from_friends:
    show mala
    mala "*咕哝咕哝*"
    player smile "嘿Mala！今天怎么样？"
    mala angry "你好[player_name]，真希望今天能好点。"
    player neutral "发生什么了？你看起来很不高兴。"
    mala @ angry "呃是啊！这个bug，React组件的设置都对但就是不工作。"
    player "明白了，搞了多久了？"
    mala "大约两小时，反复检查代码看了以前的类似工单就是找不出问题。"
    player "有什么能帮忙的吗？"
    mala @ neutral "（叹气）真不知道。"
    player "（哇——原来中级开发者也会像我一样被bug卡住。）"
    player pout"（真不想看到Mala这么沮丧，一定有什么我能做的……）"

    menu:    
        "让Mala从头解释问题并做笔记。":
            player "听说你遇到困难很难过，能一步一步跟我说说问题吗？"
            player "我甚至可以帮你做笔记？"
            mala laugh "嗯……也许是个好主意，你可以当我的橡皮鸭！"
            player surprised "抱歉你的什么？"
            mala @ smile "橡皮鸭！我的落家里了，你能代替就太好了。"
            player "抱歉但洗澡玩具和编程有什么关系？"
            mala "橡皮鸭调试法就是开发者从头一行一行看代码并解释它。"
            mala "这样大声解释代码能帮助发现最初没注意到的错误。"
            mala "通常是用开发者桌上的小橡皮鸭或物品来做，没有鸭子时同事也能胜任。"
            player smile "哈哈听起来有趣！很乐意当你的鸭子。"
            "Mala开始一行一行解释代码，你点头礼貌地听着。"
            "她解释到一半突然停下了。"
            mala @ neutral "所以这一行在这里是因为……嗯……"
            player neutral "Hm?"
            mala "仔细想想我不确定这行做什么，什么时候写的？"
            player "有留下注释或笔记吗？"
            mala "没有——我真该多写注释，删掉试试。"
            mala "……"
            mala "好了！有好消息也有坏消息。"
            player "从好消息开始？"
            mala "当然，好消息是之前的bug没了！"
            player "太棒了！坏消息呢？"
            mala "坏消息是有个新bug。"
            player smile "呃——这也是进步对吧？"
            mala @ smile "绝对是！而且知道怎么解决这个bug——比上一个有头绪多了！"
            mala "谢谢你当我的橡皮鸭，没有另一双眼睛可能想不出解决方案！"
            player "没问题！说不定以后我也试试橡皮鸭调试法。"
            mala "很荣幸当你的鸭子！"
            "因当橡皮鸭帮忙获得5声望。"
            $ player_stats.change_stats(RENOWN, 5)
    
        "找经理帮忙。":
            player neutral "她好像很投入，不该打扰她。"
            player "也许可以替她求助！Annika说过卡住就该求助。"
            player "我去找个经理帮她这样她不用停下手头工作。"
            hide mala

            show goro
            goro "……"
            player smile "Hey Goro! "
            goro "嗨[player_name]需要帮忙吗？"
            player neutral "其实不是帮我，是帮Mala！"
            goro "Mala？怎么了？"
            player "她卡在这个bug上两小时了，搞不懂为什么React组件不发GET请求。"
            goro "……"
            player "Goro？你也不知道哪里错？"
            goro "不是那个问题而是你来跟我说别人的问题。"
            player "什么意思？"
            goro "我知道你是想帮同事但大家都是成年人了。"
            goro "Mala是很聪明能干的开发者，需要时她会求助的，有时候需要自己攻克一会儿。"
            goro "更重要的是如果你找的经理跟Mala关系不好，报告这种事会给她惹麻烦。"
            goro "而且还会让她觉得你认为她做不了自己的工作。"
            player pout "哦不！那是我最不想让她想的！我从她那学到太多了。"
            goro @ smile "我理解，以后多注意就好。"
            player "我理解。"
            player "（天哪太尴尬了！）"
            "你失去了10声望。"
            $ player_stats.change_stats(RENOWN, -10)
    return

label v2_eta:
    show goro
    goro "嗨[player_name]——GoGoGames账户的工单怎么样了？"
    player "还没开始做呢，还在做市政厅网站的工单，可以吗？"
    goro "当然！那个也在做很好，只是想知道你有没有看过新工单？"
    goro "想确认你对它是否适应。"
    player "当然！没用过Flask但用过MVC框架，绝对能搞定。"
    goro "太好了！"
    goro "那你觉得能给我个时间预估吗？"
    player "时间预估？"
    goro "对！今天晚点和客户有电话，想给他们个后台完成时间的预估。"
    player "嗯……这个……"
    player "（这个项目一两天应该能完成，他们只要带路由的网站，后台功能以后扩展。）"
    player "（其实只要掌握了Flask基础应该很快。）"
    player "（但另一方面还有其他工单要做，怎么办？）"

    menu:    
        "大胆点——两天应该能完成！":
            player "嗯……记得工单看起来不难。"
            player smile "打赌两天能搞定！"
            goro "……"
            goro @ laugh "哈哈哈！挺大胆啊？"
            player "当然！应该能搞定，加一两天班就行。"
            player "也就一两天！"
            goro @ neutral "有抱负是好事但说真的不要养成这种习惯。"
            goro "工作生活平衡很重要，不好好照顾自己会倦怠无法做出最好成果。"
            goro "私下说，最好给自己比预想多几天来完成项目。"
            goro "就像你说的可能会遇到意外，也给其他项目的紧急情况留余地。"
            goro "想证明自己很好但你确定能处理好其他任务吗？"
            player "我保证！一定要出色完成。"
            goro "好的那明天见，我得回家了，祝好运！"
            player "谢谢Goro回头见！"
            player "……"
            player neutral "（叹气）好了开始吧。"
            "因提前完成项目获得15声望！但因过度劳累失去20精力。"
            $ player_stats.change_stats(RENOWN, 15)
            $ player_stats.change_stats(ENERGY, -20)
    
        "保守点——告诉他们需要一周比较安全。":
            player "嗯……记得工单看起来不难。"
            player "但想确保本周其他工单都完成，做这个时也可能遇到bug！"
            goro @ smile "保守点，不坏的主意。"
            goro "私下说，最好给自己比预想多几天来完成项目。"
            goro "就像你说的可能会遇到意外，也给其他项目的紧急情况留余地。"
            player smile "对！这样感觉能应对任何情况。"
            goro "好样的，我去跟客户更新，谢谢[player_name]。"
            "因有充足时间完成本周任务获得10精力。"
            $ player_stats.change_stats(ENERGY, 10)
    return

label v2_motormouth:
    player "呼——今天真顺！下午3点已完成所有工单，渴死了！"
    player "好像看到市场部的Mike在饮水机那边，去打个招呼！"
    player smile "嗨Mike！有什么新鲜事？"
    mike "[player_name]！没什么——周末怎样？"
    "你们礼貌地聊了会儿非工作话题，轻松愉快！"
    "如此放松获得了10精力！"
    $ player_stats.change_stats(ENERGY, 10)
    "看钟发现已经站了10分钟。"
    "You suddenly remember an office rumor you heard in passing – Mike is probably the nicest guy in the office, but he's really, really... “chatty”."
    "他们给他起什么外号来着？跟车有关？"
    motormouth_mike "对了——你有看星际少女银河吗？"
    player laugh "（抽气）！我爱星际少女银河！最喜欢的节目！但那不是2000年代初的吗？"
    motormouth_mike "不会吧——你不知道重制版？用了现代特效和CGI！"
    motormouth_mike "你最喜欢哪个角色？！"
    "不敢相信自己的耳朵！想了解更多但也想回去工作。"
    "但是跟Mike聊天好像对精力有好处，要留下来聊吗？"

    menu:    
        "多聊几分钟没关系。":
            player smile "听说有新游戏但以为是2003版画面升级！"
            motormouth_mike "不——是全新游戏基于新电视剧！3D开放世界。"
            player surprised "不会吧！那个无敌道具会回归吗？"
            "你们又聊了会儿互相分享原版游戏的奋斗故事。"
            "猜新游戏功能太开心了又获得10精力。"
            "看钟发现又过了10分钟。"
            motormouth_mike "超酷的是新游戏预告片用了Quinn C. Larkson的新歌From the Ground Up。"
            player "什么？！你也喜欢Quinn C. Larkson？"
            motormouth_mike "谁不喜欢？你最爱哪首？我最爱Cruising for A Musing！"
            "你们连音乐品味都相似？巧合不断！"
            $ player_stats.change_stats(ENERGY, 20)
            "但跟Mike聊了好一会儿了，很开心但该回去工作了？"
            "或者继续聊下去？好久没这么放松了（也许该多出来走走？）。"
            "你要怎么做？"

            menu:
                "多聊几分钟没关系。":
                    player smile "嗯……最爱的歌大概是Never Not Favored，但也超爱Chasing That Feeling！"
                    show iris
                    iris "我更喜欢Scratching the Surface。"
                    player surprised "伊里斯"
                    motormouth_mike "Benson女士！早上好！"
                    iris angry "现在已经是下午了，我看你们聊了30分钟了。"
                    iris "Mike你不用工作吗？Walter Co. Construction的大演示明天截止。"
                    motormouth_mike "当然！该走了——回见[player_name]！"
                    player neutral sweat "再见Mike，我也该走了——"
                    iris "慢着，你在干什么？"
                    iris "Do we have a “Loquacious [player_name]” to match Motormouth Mike now?"
                    player -sweat "Mike总在饮水机那边所以觉得休息一下没问题……"
                    iris "休息可以但站太久会显得你没做什么工作。"
                    iris "想想——Mike在公司5年了不该这样但至少有资历，一个新来的初级？"
                    iris "不太好看，明白吗？"
                    player "是……"
                    iris "好，回去工作。"
                    "获得30精力但全丢了还多丢了10。"
                    $ player_stats.change_stats(ENERGY, -30)
                    $ player_stats.change_stats(ENERGY, -10)
            
                "该回去工作了":
                    player smile "抱歉快嘴——我是说Mike，我很喜欢Quinn C. Larkson但有项目要回去做。"
                    motormouth_mike "没问题兄弟！饮水机见，回家看预告片下次一起聊！"
                    player "会的！"
                    "总计获得30精力。"
    
        "该回去工作了":
            player smile "抱歉快嘴——Mike，我爱游戏跟爱星际少女一样但有项目要回去做。"
            motormouth_mike "没问题兄弟！饮水机见，回家看下次聊！"
            player "会的！"
            "总计获得10精力。"
    return

label v2_message:
    show darius
    darius "[player_name]！有空吗？"
    player "有！怎么了？"
    darius "能帮我看个React bug吗？卡了一早上了。"
    player "当然！我也是初级但会尽力。"
    player "……"
    player surprised "哦！"
    darius @ confused "你知道怎么修吗？"
    player neutral "不完全知道但Goro和我昨天遇到过！"
    player "可以自己调但我和他搞了两小时。"
    darius @ neutral "那可不行！产品团队催了好久了。"
    player "给他发个快速消息吧。"
    player "嗯……好像在开会。"
    darius "哦——要等吗？"
    player "嗯……"

    menu:
        "发个快速消息":
            player "我是说……快速消息，这个很紧急对吧？"
            darius "当然！"
            player "就快速发一条。"
            scene bg company1_breakroom with blinds
            "发完消息你和Darius去休息室拿零食。"
            scene bg company1_center with blinds
            "回来时Goro在你桌前等着。"
            "……他看起来不高兴。"

            show goro
            player "嗨Goro！"
            player "……"
            player "怎么了？"
            goro "你知道你发消息时我在开会吗？"
            player worry "是的……抱歉，看到TeamChat上显示你在开会。"
            player "我打扰什么了吗？"
            goro "……"
            goro "我不只是在开会。"
            goro "我正在投屏演示。"
            player surprised "哦！"
            player worry "你是说……所有人都看到我的消息了？"
            goro "不仅所有人都看到了而且是对着董事会演示的。"
            player "董事会？"
            goro "给我们公司投资的人，最高层。"
            player pout "……"
            goro "[player_name]看到别人在开会就别发消息。"
            goro "以后等会议结束再发，好吗？"
    
        "等会议结束":
            player "不……还是等等。"
            player "开会时他没法回消息对吧？"
            player "反正都得等他结束。"
            darius "对，也不知道会不会打断重要的事……"
            scene bg company1_breakroom with blinds
            "没发消息而是和Darius去休息室拿零食。"
            scene bg company1_center with blinds
            "回来时Goro在桌前打字。"
            "你们找Goro帮忙，叫上Darius解释找到的bug解决方案。"
            "你和Darius准备离开时Goro叫住你们。"

            show goro
            goro "嘿！聊一下。"
            goro "Darius说你们想过联系我。"
            goro @ smile "真的很高兴你们没发。"
            player smile "没问题！你的演示重要吗？"
            goro @ neutral "我不只是在开会。"
            goro "我正在投屏演示。"
            player surprised "哦！"
            player "你是说……所有人都会看到我的消息？"
            goro "不仅全都看到还是对着董事会。"
            player "董事会？"
            goro "给我们公司投资的人，最高层。"
            player neutral "哇！那会是……超级尴尬。"
            goro "谁说不是！你我都尴尬！"
            goro "永远记住看到别人在开会就别发消息。"
            goro "就像刚才那样等事情结束。"
            goro "你永远不知道会打断什么直到为时已晚。"
            "因耐心获得10声望。"
            $ player_stats.change_stats(RENOWN, 10)
    return

label v2_css:
    player smile "大家再见！到点了——收拾回家。"

    show goro
    goro smile "等一下[player_name]。"
    goro "走之前能帮个忙吗？"
    player "当然Goro！什么事？"
    goro "关于4497号工单。"
    goro "做得很好！只是首页CSS有点小问题。"
    goro "能看看吗？"
    player "当然！走之前搞定。"

    scene bg company1_lydia_cubicle with dissolve
    player neutral "……"
    player "看起来首页有些CSS类互相冲突。"
    player "有点担心因为其中一个类在很多地方使用。"
    player "可以用内联CSS快速修复但知道这通常不太好……"
    player "也可以晚点走做个正规修复。"

    menu:   
        "快速写内联CSS":
            player "很晚了……不知道爸妈什么时候回家喂Mint。"
            player "就加点内联CSS修一下。"
            "你是忙碌的开发者——有时走捷径也无妨。"

            if renpy.random.random() < 0.5:
                "……但有时确实会，以后会出问题吗？"
                "谁知道呢，按时回家获得10精力。"
                $ player_stats.change_stats(ENERGY, 10)
            else:
                player "很晚了……不知道爸妈什么时候回家喂Mint。"
                player "就加点内联CSS修一下。"
                "你是忙碌的开发者——有时走捷径也无妨。"
                "……但有时真的会。"
                goro "嘿！工单怎么样了？"
                player "啊！Goro吓我一跳，以为你走了。"
                goro "原来我自己也有工单要修，你弄完了？"
                player "嗯……对！全做完了！"
                goro "酷！最后怎么解决的？"
                player "（天哪他会发现的……）"
                goro "慢着——内联CSS？"
                goro "虽然快但不是最佳实践。"
                player "觉得应该没事……已经很晚了。"
                goro "但我只是让你看看工单。"
                goro "了解问题原因明天再回来也可以。"
                goro "宁愿你花时间做正确方案而不是扔内联CSS。"
                goro "如果其他页面也出现怎么办？就一直复制粘贴CSS？"
                player pout "（叹气）你说得对。"
                goro "看起来你知道问题原因只需要找个比内联CSS更长期的方案。"
                goro "今天先回家吧。"
                player neutral "好早上见。"
                "收拾东西尴尬于被抓到用了快速脏修复。"
                "因内联方案失去5声望。"
                $ player_stats.change_stats(RENOWN, -5)
   
        "花时间修复冲突类":
            player pout "（叹气）拖延没意义……"
            player "总有一天会变成别人的问题——甚至是我自己的。"
            player "所以第一次就该做对。"
            player smile "给爸妈打电话确保Mint有饭吃然后开始。"
            "做对的事有回报！但好事总没回报。"
            "因做对的事获得10声望但因加班失去5精力。"
            $ player_stats.change_stats(RENOWN, 10)
            $ player_stats.change_stats(ENERGY, -5)
    return

label v2_thick:
    player pout "呃……下午5点了还差得远！"

    show darius
    darius @ smile "姑娘你看起来很紧张，怎么了？"
    player "是这破工单。"
    player neutral "记得Canyon Building Company的工单吗？给他们做CRM那个？"
    darius @ neutral "对——我们同意那个是4分的。"
    darius "对了……希望不会太无知，什么是CRM？大家都在说我不敢问。"
    player "别担心——我四天前也完全不知道！"
    player "It stands for “Customer Relationship Manager”. "
    player "就是让你跟踪公司客户信息的软件。"
    player "可以记录联系信息、入职阶段、历史销售记录等。"
    player "类似这些。"
    darius "啊明白了，那CRM怎么了？"
    player "在待办整理时大家都同意修这个bug大约需要四天。"
    player "但已经五天了才做到一半。"
    player "已经找Goro、Mike和Mala帮了几十次了。"
    player "一方面觉得自己有问题做得太慢。"
    player "好像……也许我是差劲的开发者。"
    player "但也许不是？也许有别的问题？"
    darius "听起来压力很大，无论如何得做点什么……已过截止日期一天了。"
    darius "要么硬撑着尽快做完，"
    darius "要么跟Goro或Iris说。"
    player "嗯……也许Goro，Iris有点吓人。"
    darius "她吓到我们所有人。"
    darius "不管怎样你不是差劲开发者，别这样看自己好吗？"
    darius "跟你工作几个月了觉得你总是在努力学习新东西。"
    player smile "谢谢Darius这对我很重要。"

    hide darius with moveoutright
    player neutral "嗯……那我该怎么办？"
    player "也许该跟Goro说？这个工单挺难不知道初级做这么多是否正常。"
    player "另一方面可以加会班……应该明天晚上能做完。"
    
    menu:
        "跟Goro说工单难度。":
            player "不……应该跟Goro说。"
            player "从没在工单上花超过三四天。"
            player "也许是信任我给更多责任但也可能是别的问题？"

            show goro
            goro "嘿新手怎么了？看起来很累。"
            player pout "谢谢。"
            goro @ smile "我不是那个意思！是关于4522工单吗？"
            player neutral "对Canyon Building Company账户。"
            player "这个bug修了五天了……有进展但感觉还有很多。"
            player "能看看吗？"
            goro @ neutral "当然！我看看。"
            goro "... "
            goro "嗯。"
            goro "我以为上个工单加的功能只破坏了一个组件？"
            player "不是，每次修改修一个组件另一个就坏了。"
            goro "明白了来找我是对的——这个工单的范围扩大了。"
            player "什么意思？"
            goro "有时工单看起来只坏了一个东西但实际整个系统都要重写。"
            goro "When that happens, we don't just go, “Welp, that's your problem, since you accepted the ticket.”"
            goro "意味着需要重组把这个任务拆成多个各有分数的工单，"
            goro "或者给你的工单重新估分。"
            goro "记住评分系统是用来估计任务难度的。"
            goro "我们评了3分但看起来是8分的。"
            player "8分的？！"
            goro "对不能指望你一个人做……"
            goro "或者可以但需要超过五天。"
            player "天哪还好说了！"
            player "那现在怎么办？"
            goro "停掉这个工单做另一个。"
            goro "我来看看怎么拆分，明天站会讨论。"
            player smile "谢谢Goro！松了一口气……"
            goro "别放松太早！还有很多工作。"
            goro @ smile "但至少不用一个人扛了。"
            "因不用独自处理巨兽工单获得10精力。"
            $ player_stats.change_stats(ENERGY, 10)

        "硬撑着做完。":
            player pout "（叹气）"
            player "觉得加班一两天也许能完成。"
            player "成为开发者就是为了在困难时不放弃。"
            player neutral "而且不想让大家觉得我半途而废。"
            "你加了好几个小时的班。"
            "看着太阳落在办公楼后面感到疲惫。"
            "快晚上8点了连清洁工都在准备锁门。"

            play sound 'audio/sfx/social_media_notification.wav'
            show goro
            "突然收到Goro的TeamChat消息。"
            goro "嘿新手怎么这么晚还在？"
            goro "I saw that your TeamChat status was set to “Online” while I was double-checking some of my own work, so I thought I'd shoot you a message."
            player "嘿Goro。"
            player "在做4522工单。"
            goro "Canyon Building Company账户是吧？"
            goro "正要问你呢，有进展吗？"
            player "关于这个……本来不想说因为明天该做完了但我还在办公室。"
            goro "你在干什么？[player_name]快8点了独自在办公室不安全。"
            goro "为什么不求助？？"
            player "To be honest, it just seemed like such a “junior” thing to do..."
            goro "但你确实是初级啊。"
            goro "什么问题？能把做完的提交然后回家吗？"
            goro "你到家时我应该已经看完了。"
            goro "不管怎样我不想你一个人在这么大的楼里，我们楼层没安保可能有怪人。"
            player "好我开始回去。"

            scene bg bedroom with fadehold
            pause 2.0
            scene bg laptop_screen night with blinds
            play sound 'audio/sfx/social_media_notification.wav'
            show goro
            goro "我好像看出问题了。"
            goro "我以为上个工单加的功能只破坏了一个组件？"
            player "不是，每次修改修一个组件另一个就坏了。"
            player "目前手动修了五个。"
            goro "还有多少要修？"
            player "大约十二个。"
            goro "[player_name]！遇到这种事必须告诉我们。"
            goro "It seems like the scope of this ticket has grown."
            player "什么意思？"
            goro "有时工单看起来只坏了一个东西但实际整个系统都要重写。"
            goro "When that happens, we don't just go, “Welp, that's your problem, since you accepted the ticket.”"
            goro "意味着需要重组把这个任务拆成多个各有分数的工单，"
            goro "或者给你的工单重新估分。"
            goro "记住评分系统是用来估计任务难度的。"
            goro "我们评了3分但看起来是8分的。"
            player surprised "8分的？！"
            goro "对不能指望你一个人做……"
            goro "或者可以但需要超过五天。"
            player worry "天哪……现在该怎么办？"
            goro "停掉这个工单做另一个。"
            goro "吃晚饭玩点有趣的事睡觉随便。"
            goro "先放下这个工单。"
            goro "我来看看怎么拆分，明天站会讨论。"
            player pout "收到谢谢Goro……抱歉让你担心。"
            goro "没事答应我别再这样好吗？需要时求助。"
            "因在办公室待太晚失去15精力。"
            $ player_stats.change_stats(ENERGY, -15)
    return

label v2_success:
    show mala
    mala "嘿[player_name]能聊一下吗？"
    player "当然！什么事？"
    mala "我觉得可能搞砸了，真的搞砸了……"
    player "怎么了？肯定没那么糟。"
    mala "我在做Braze Salon的账户。"
    mala "他们要标记店铺位置的互动地图。"
    player "那不太难吧？网站上添加Schmoogle地图就行。"
    mala "本来很简单但犯了个小（但严重）错误。"
    mala "可能不小心把API密钥发到公开仓库了。"
    player "API密钥？那是什么？"
    mala "不是所有API都免费。"
    mala "大量CRUD请求消耗很多资源创建者需要为托管付费。"
    mala "即使API免费如果发上千请求搞崩别人依赖的API也是个问题。"
    mala "为让API使用者对请求次数负责每人都有API密钥。"
    mala "公司为Braze Salon申请了Schmoogle地图服务的API密钥。"
    mala "然后……我觉得把它发出去了。"
    player surprised "发出去了？！你是说存到代码仓库了？"
    player worry "私……私有仓库对吧？"
    mala "我也希望是！"
    player "天哪……这确实很严重。"
    player "已经删了吧？"
    mala "删了尽快删了但还是很慌。"
    mala "Schmoogle每千次CRUD请求收费我们为Braze Salon谈了10万免费额度。"
    mala "如果网上有人拿到那个API密钥……"
    mala "那公司要赔一大笔钱……"
    mala "我该怎么办？"

    menu:
        "就是个错误犯错误没关系。":
            player neutral "有收到关于这个的TeamChat消息吗？"
            mala "还没有。"
            player "那可能是多虑了？"
            player "不小心发了但马上删了没造成伤害对吧？"
            mala "我想是吧……"
            player "去吃午饭吧也许能分散注意力。"
            hide mala
            scene bg company1_center with fadehold
            "下午晚些时候……"
            player "呼吃饱了！应该能在回家前搞定工单。"

            play sound 'audio/sfx/social_media_notification.wav'
            player "嗯……这是什么？Iris发了邮件？"
            player "标了紧急最好看看免得她当面找我。"
            player "也许不只是找我——整个部门都被抄送了！"
            show iris
            iris "敬启者，"
            iris "最近发生了一起事件，借此机会提醒大家错误是正常的。"
            iris "错误是开发好产品或提供好服务的一部分帮助我们成长提醒我们是人。"
            iris "不正常不好的是犯了高风险错误却不告诉任何人。"
            iris "今早某员工（谁不重要）把Schmoogle地图API密钥发到公开仓库。"
            iris "API密钥很快被删除公司有六位数Schmoogle额度没损失钱。"
            iris "但Schmoogle立即给客户发了邮件警告机器人检测到公开发布的密钥。"
            iris "对不了解的人，机器人指Schmoogle搜索比人快得多的扫描软件。"
            iris "速度快到在数百万用户中几分钟内就发现了API密钥。"
            iris "但有恶意的人也有机器人专门用于窃取API密钥。"
            iris "客户可能因此损失大笔钱。"
            iris "他们被告知赶紧删除并警告了后果。"
            iris "可以想象这对公司形象不好。"
            iris "Had we been notified of this issue, we could've address it – possibly before our client even saw the email."
            iris "至少看起来像犯错但能控制局面的公司。"
            iris "现在高级开发者在开会努力留住客户，客户感到被背叛。"
            iris "不要像那位匿名员工，不要隐瞒可能伤害自己或团队的信息。"
            iris "对此次事件和后续步骤有疑问请随时发邮件或TeamChat。"
            player "哦不……Mala……"
            "又一个小时没看到Mala她在Iris办公室被教训。"
            "幸好没被PIP（绩效改进计划通常是解雇前一步）但Iris暂时对她印象不好。"
            "你忍不住愧疚因为建议她说事情会过去。"
            "失去10声望Mala说没事但看得出她有点不高兴。"
            $ player_stats.change_stats(RENOWN, -10)

        "要不要告诉别人？":
            player "不告诉别人可能不好。"
            player "发出去的密钥没法收回但直觉告诉你要告诉团队的人。"
            mala sweat "（叹气）……你说得对。"
            mala "只是……不想告诉Iris……"
            player "是啊给多少钱我也不想。"
            player "但主动告诉人比较好对吧？"
            player "可以告诉Goro让Goro跟Iris说，他们关系不错。"
            player "不知怎么。"
            mala -sweat "你说得对。"
            mala "比放着不管好多了，我现在去告诉他回来一起吃午饭？"
            player "当然——想去办公室那条街的泰国餐厅好久了！"
            "20分钟后Mala回来了。"
            player "看起来心情不错！没事吧？"
            mala "不敢说心情好但确实松了一口气！"
            mala "Goro很担心但考虑到刚发生的事他处理得很好。"
            mala "他说来不及解释因为他和其他高工会快速行动，"
            mala "但基本躲过一劫我可能也保住了工作。"
            player relieved "矮油"
            player neutral "如果不说会怎样？"
            mala "Goro说他以前也犯过类似错误。"
            mala "说服务商立即发邮件警告机器人检测到公开发布的密钥。"
            player "机器人？"
            mala "机器人就是用比人快得多的速度扫描网页的软件。"
            mala "Schmoogle是全球最大科技公司随时有数百万机器人在搜索。"
            mala "因为仓库在网页上他们能找到。"
            mala "速度快到在数百万用户中几分钟就找到了我发的密钥。"
            player smile "太好了！这是好事吧？！"
            mala sweat "……"
            player "Ok!"
            player pout "或者不是！"
            player neutral "告诉我为什么不好？"
            mala -sweat "恶意的人也有机器人专门用来窃取API密钥。"
            mala "客户可能因此损失大笔钱。"
            mala "Goro说Schmoogle发现密钥会先发邮件给客户，"
            mala "因为他们是创建密钥的Schmoogle账户所有者。"
            player "I see. And that would have looked pretty bad on us..."
            mala "没错那会让我们看起来很无能。"
            mala "所以他赶紧发邮件给客户然后找Iris汇报。"
            mala "他说客户很好如果我们先告诉他们大概会没事。"
            mala "他甚至说不会告诉Iris是谁干的！"
            player "真的？！哇！我以为那是流程的一部分？"
            mala "他说指责会影响团队士气。"
            mala "但他说如果情况恶化客户很生气可能得让Iris知道。"
            player "……"
            player "现在别想那个了。"
            mala @ smile "嗯。"
            mala "那泰国菜？"
            player laugh "泰国菜！"
            "你们去吃了美味午餐泰国菜跟办公室人说得一样好。"
            "Mala告诉Goro是你指出应该说而不是隐瞒。"
            "他说替他感谢你。"
            "因好建议和负责思考获得10声望。"
            $ player_stats.change_stats(RENOWN, 10)
    return

label v2_competent:
    show goro
    goro "[player_name]！#999工单怎样了？"
    player "进展不错但还没开始！"
    goro "没问题——记得这个是做什么的吗？"
    player "说实话早上开会时脑子有点糊打算重读工单。"
    goro "要我帮你省点时间吗？"
    player smile "不会拒绝的！"
    goro @ smile "酷！Juan要离开几个月。"
    player surprised "什么？中级开发者对吧？没事吧？"
    goro "一切都好——其实很好！"
    goro "他和他伴侣刚收养了第一个孩子想请几个月假在家。"
    player smile "难怪没见到他——太好了！"
    goro @ neutral "他走前我们尽量问了他写的代码几天内还好，"
    goro "但都忘了Juan在做一个重要功能。"
    goro "它做很多事情但没人知道具体怎么工作。"
    goro "功能之一是在项目数据库中删除重复记录客户有带评论系统的博客，"
    goro "如果有重复评论就会删掉。"
    goro "但用户开始看到越来越多重复。"
    goro "说明重复确实被创建了但那是另一个工单。"
    goro "现在需要人看他的功能找出为什么重复没被删除。"
    player surprised "哇……我同意的？"
    goro "开会得多注意啊（笑）。"
    goro "但是的没错，你能做吗？以前做过类似的吗？"
    player smile "说实话没做过但会尽力！"
    goro @ laugh "太棒了！需要帮忙来找我。"
    hide goro with moveoutright

    player neutral "好……那么。"
    player "需要搞懂这个功能怎么工作才能修。"
    player "工单说函数叫background_jobs()还给了文件位置。"
    player "从哪开始？"

    default v2_competent_choices_visited = set()

    menu v2_competent_choices:
        set v2_competent_choices_visited

        "用全局搜索找函数的使用位置":
            player neutral "好起点是运行全局搜索！"
            player "这样可以搜索仓库每个文件看到background_jobs()所有使用位置。"
            player sweat "好……用到了好多地方。"
            player -sweat "但找找就能看到别人用这个函数的例子。"
            player "这样能了解函数该在什么情况使用给出用法线索。"
            jump v2_competent_choices

        "看函数的测试":
            player neutral "嗯……该检查这个函数的所有测试。"
            player "通常测试有描述性代码块解释测试要检查什么。"
            player "测试文字能提示函数的预期功能。"
            player "还能运行所有测试重点关注失败的。"
            player "这能告诉我从哪开始修复还确保所有测试通过。"
            jump v2_competent_choices

        "在控制台调用函数玩一玩":
            player neutral "想看函数怎么工作可以在控制台玩玩！"
            player "大多数语言都有某种控制台可以立即执行代码。"
            player "项目后台是Ruby on Rails在Rails控制台用不同方式调用函数。"
            player "用不同参数和情况测试也许能找出哪里出错。"
            player "重写后也能在控制台手动测试！"
            jump v2_competent_choices

        "问创建函数的开发者":
            player neutral "正常这是好选择……"
            player pout "如果创建者真的在的话！Juan在休陪产假记得吗？（叹气）"
            jump v2_competent_choices

        "我觉得信息足够了" if len(v2_competent_choices_visited) > 2:
            pass

    player relieved "好了！信息收集够了。"
    player neutral "开始追bug！"
    "接下来的一个多小时你诊断了问题所有重复都被删除了！"
    "功能其余部分也恢复正常了。"
    "不过还差一块拼图……重复最初为什么会被创建？"
    "提交代码后你叫Goro来做面对面代码审查。"

    show goro
    player "……这就是我怎么做到现在的。"
    player "你觉得怎样？看起来都对吗？"
    goro @ smile "对我看起来挺扎实的！做得好。"
    goro "删掉多余注释就好了。"
    player smile "谢谢！"
    player neutral "对了找到最初创建重复的原因了吗？"
    goro "找到了！"
    goro "听好了——问题一直在前端！"
    goro "Basically, the app would send off a post request, and users would be prompted with a loading screen that would request that they wait while their progress was saved."
    goro "但人们一直点提交按钮。"
    goro "所以收到多个请求。"
    player "总是一些小问题！"
    goro "对经典PEBCAK。"
    player @ surprised "什么？"
    goro @ smile "别管了。"
    goro "吃午饭吗？"
    player "你知道我想！"
    "厉害侦探技能！因函数调查获得5声望。"
    $ player_stats.change_stats(RENOWN, 5)
    return

label v2_automate:
    show goro
    goro "记得我们安排这个会议做什么吗？"
    player "不太记得……能再解释一次吗？"
    goro "好的每次会议都有会议记录，就是跟踪讨论内容的日志。"
    goro "每周轮流做记录，这周是我下周是你。"
    goro "我知道很烦但得手动把会议记录复制粘贴到电子表格软件。"
    player "但……为什么？好多记录——感觉要花很久。"
    goro "是啊（苦脸）。"
    goro "通常要花45分钟……这还是专注的时候否则要一个多小时。"
    goro "回答你的问题也没什么理由就是个低效系统。"
    goro "很多团队不做但管理层要我们做以确保时间利用好。"
    goro "以后也许能改但现在做会议记录吧！来看看怎么设置。"
    "你们一起坐了30分钟学习用团队复杂电子表格设置会议记录。"
    "最后Goro让你自己工作。"
    hide goro with moveoutright

    player "天哪……该开始了。"
    player "Goro说这是老办法但一定有更快的方法。"
    player "嗯……也许可以用Python自动化？"
    player "记得在YouTube看到freeCodeCamp用Python自动化Excel的视频。"
    player "也许我也能做到？"
    player "但……Goro刚花那么多时间解释怎么做一定有没有自动化的原因。"
    player "而且从没做过自动化该怎么办？"

    menu:
        "用老办法以后再说自动化。":
            player "嗯……也许改天再自动化。"
            player "Goro刚花时间展示老办法也许有原因？"
            player "也许没人自动化是有原因的？"
            player "也许亲自做一两次老办法记笔记更好方便以后自动化。"
            player "好吧……还是开始吧。"
            "一方面你庆幸保守了。"
            "但Goro教的只是皮毛手动做比想象长得多。"
            "Goro有经验要一小时。"
            "你花了两个多小时。"
            "记了大量笔记学自动化但这次因枯燥工作失去10精力。"
            $ player_stats.change_stats(ENERGY, -10)

        "花时间自动化会议记录。":
            player "嗯……无法摆脱这能自动化的想法。"
            player "先备份原始和第二个电子表格以防搞砸。"
            player "然后做一两行数据。"
            player "列出所有需要完成的任务……比如把文本文档的列表项转到第二电子表格第一行第一列。"
            player "遇到换行时"
            player "列出动作编程实现直到过程完成……"
            "不知不觉你在IDE里努力做自动化项目。"
            "庆幸开始前备份了因为最初几次运行搞砸了。"
            "初始版本运行不错把必要信息转到主文档对应行列。"
            "但运行时发现少了测试用例比如周五的会议记录比周三多一两个会议。"
            "于是也为那些情况写了代码。"
            "不知不觉过了两小时Goro回来了。"
            goro "嘿！撞墙了吗？"
            player "等下……再一秒……"
            player smile "好了……完成！看看这个！"
            goro "……"
            goro @ laugh "不会吧！"
            goro "你把会议记录转到电子表格自动化了？"
            player "是的！"
            player "It's not 100\% perfect - there's one or two fields in the spreadsheet that we need to fill out manually, but this covers about 80\% of the work."
            goro "现在花多长时间？"
            player "大约10分钟脚本运行10秒其余是手动部分。"
            goro "做得好新手！"
            goro "也许这就是非传统背景入行的优势。"
            goro "你们看待问题的方式我们这些老人看不到。"
            goro "干得好！"
            goro @ smile "值得我请午餐。"
            goro "不是我真的请，公司卡，来吗？"
            player @ laugh "当然！"
            "因聪明想法获得10声望。"
            $ player_stats.change_stats(RENOWN, 10)
    return

label v2_demo:
    scene bg company1_boardroom with fadehold
    show darius at right
    show goro at left
    darius "昨天就做了这些。"
    darius "今天主要想完成Farraday账户架构的修复。"
    goro "好——谢谢更新Darius。"
    goro "Darius是今天站会最后更新。"
    goro "祝大家愉快！"

    scene bg company1_center with blinds
    show mala
    player "嘿Mala！能快速问个问题吗？"
    mala "当然！怎么帮你小鱼？" # Ed: Is fishie a nickname for the player? If so, Fishie would be better.
    player "不想打断站会因为Goro说要去下个会议，"
    player "能说清楚Iris分配给我的数据库工单要做什么吗？"
    mala "哦对——销售团队那个？"
    player "对！据我理解是要清理数据……？"
    mala "差不多——ConsultMe有销售团队。"
    mala "负责让市场部带来的客户购买我们的服务。"
    mala "为方便他们有演示网站和应用可以在会议中给潜在客户看。"
    player @ surprised "演示网站？是真的可运行的应用吗？"
    mala "对！有电商应用、落地页、博客——应有尽有！"
    player "挺聪明……是互动的吗？"
    mala @ smile "是！客户跟代表通话时可以进去体验应用看看怎么工作。"
    mala "所有应用需要假数据来提供最真实的体验。"
    mala "数据会变乱比如有人进博客应用改标题，"
    mala "或在电商店面用占位图片和文字创建样品产品。"
    mala "所以我们做了酷仪表盘销售员点按钮就能生成博客应用的全新评论和帖子记录，"
    mala "products and descriptions for the eCommerce apps – that sort of thing."
    mala "问题是每次生成新数据只是隐藏了旧数据？"
    player "隐藏？等等……"
    player "你是说没删除？"
    mala "不每次演示创建约30条新记录。"
    mala "可以想象销售演示数据库被严重塞满。"
    player "所以需要人写脚本删除数据？"
    mala "跟Goro谈了写了工单下个冲刺自动化。"
    mala "你和Darius会一起做！（开心）"
    mala "但现在需要你手动删除数据。"
    mala "Darius以前做过知道流程我们想让你熟悉架构因为下个冲刺要写脚本。"
    player "明白了！就是进演示数据库删旧数据？"
    mala "对！删除超过两周的数据那么旧的对销售团队没用了。"
    player "酷！听起来挺简单什么数据库？"
    mala "是Postgres数据库查看入职时发的文档有访问命令。"
    mala "一定要先在staging测试再开始删除。"
    player "一直想问——什么是staging？"
    mala "我们为客户设置了几个不同的数据库和开发环境："
    mala "首先是本地数据库就是存在你电脑上的版本。"
    mala "修改时变化只发生在你的机器——也就是本地。"
    mala "Next, there's your prod environment – prod is short for “production”."
    mala "这是应用和网站上线公开时实际访问的数据。"
    mala "Finally, we have staging. Staging is “live” in the sense that it isn't only on your computer, but it can't be accessed by people outside of the company."
    mala "基本让我们能玩数据和功能看上线后效果像是中间环境。"
    mala "这些数据库通常有不同种子staging数据比生产多得多。"
    mala "需要修改prod数据库时——"
    mala "——销售演示数据库就是——"
    mala "通常先对staging做。"
    mala "因为staging每周自动刷新种子或搞砸时用简单命令重置。"
    mala "所以熟悉时可以随便犯错（开心）。"
    player "好——信息量很大但应该都懂了！"
    player "剩下就是开始了！"
    mala @ smile "就喜欢你这点小鱼——精力充沛！"
    mala "记住——"
    mala "——我再怎么强调也不为过——"
    mala "在生产环境尝试前先在staging测试查询和删除命令好吗？"
    mala "别忘了随时找我帮忙！"
    player "收到！"

    scene bg company1_lydia_cubicle with blinds
    "回到桌前看Postgres文档了解基本查询。"
    "觉得掌握了搜索特定记录决定试试删除。"
    player "还不错！"
    player "好久没写SQL了忘了多有趣（开心）。"
    player "Mala说要从博客引擎销售演示开始删除所有帖子。"
    player "如果这样做……"
    player "好了！成功删除三个特定记录。"
    player "看看能不能多删几个……"
    player "……太棒了！整张表都搞定了！看起来只有最近7天的博客评论留在评论区。"
    player "不知道……"
    player "也许能写一个大的查询？"
    player "一个能处理演示数据库所有表数据的查询？"
    player "用和上个查询一样的逻辑……" # Ed: In the following lines it says that the player spends the next 15 minutes writing the logic for the long SQL query. Maybe it would be better to say something like "The logic for that would be similar, but would need some tweaking..."
    player "那今天就能早完成了！Mint两周没洗澡了今天通勤后真不想做这个。"
    "接下来15分钟写了能一次处理所有数据库表的长SQL查询。"
    "反复检查逻辑还在网上找到类似例子。"
    "最后脚本完成准备运行命令。"
    player "好……试试看。"
    player "……"
    play sound 'audio/sfx/keyboard_typing.wav'
    "你等着。"
    "继续等。"
    "还在等。"
    "开始很无聊了。"
    player pout "天哪……太久了。"
    player "做错了吗？记得Goro说大查询可能需要时间但这太夸张了……"
    player "也许该中止脚本看看命令是否在工作？"
    "中止脚本检查查询中包含的几个数据库。"
    player neutral "嗯……查询有问题吗？"
    player sweat "看起来删掉了脚本接触过的所有表的数据。"
    player "这么久是因为让它一个个删记录而不是一次全删然后删完把整张表都删了……"
    player -sweat "哦好吧。"
    player "至少像Mala说的可以重新运行种子——"

    play sound 'audio/sfx/office_ambient.wav'
    salesperson1 "搞什么？我的演示怎么了？"
    player surprised "... Huh?"

    scene bg company1_center with blinds
    "You peek your head out of your cubicle"
    salesperson2 "你的也是？以为我疯了——进不去博客演示。"
    salesperson3 "电商演示也进不去怎么回事？"
    player pout "搞什么……"

    scene bg company1_lydia_cubicle with blinds
    "冲回电脑开始慌这一直在删staging的数据吧？"
    show mala
    mala "[player_name]……已经开始删数据了？"
    player neutral "是……"
    mala sweat "好……好的……你是在STAGING删的对吧？"
    mala "不是生产环境？"
    player sweat "……"
    show iris at right with moveinright
    iris "[player_name]."
    player "Iris！"
    iris "……"
    iris "跟我来。"
    iris "请现在。"

    scene bg company1_breakroom with blinds
    "接下来10分钟感觉像几小时。"
    "Iris非常生气Goro更多是失望。"
    "那更难受。"
    show iris at left
    show goro at right
    iris @ angry "你明白你做了什么吗？"
    iris @ disgust "We've had to cancel 70\% of our demos over the next couple of days while we get all of this figured out."
    goro @ disgust "Mala说她提醒过你要在staging检查数据对吗？"
    player worry "是……"
    goro "哦[player_name]……"
    iris "这可能让公司损失不少钱。"
    iris "可能还能留住潜在客户。"
    iris "但也可能在修这个时被其他咨询公司抢走。"
    iris "不知怎么不仅删了演示数据库的表还删了数据库集群中同名的表。"
    player "具体什么意思？"
    goro "还有其他为客户建的在线博客。"
    goro "不仅删了演示中的关键数据库还删了客户的数据。"
    goro "以评论区为例——我们有几个博客的数据库定期更新。"
    goro "你也删了他们的评论区表。"
    player pout "……"
    goro "幸好删除的表有备份但发现的客户不高兴。"
    player "真的真的很抱歉。"
    iris "那不够[player_name]。"
    iris "需要更小心承认被提醒过风险。"
    iris "你是初级但希望你在岗位上成长已经几个月了。"
    iris @ disgust "期待更好表现也许招聘该更严格。"
    iris "恐怕需要给你PIP。"
    player "P……PIP？那是什么？"
    goro "Iris有点严苛了吧？"
    goro "[player_name]作为初级表现很好——"
    iris "这没得商量Goro。"
    hide iris with moveoutleft

    player pout "但PIP什么意思？"
    show goro neutral
    goro "PIP是绩效改进计划。"
    goro "意味着接下来几个月你将被……审查。"
    goro "基本就是如果不改进就会被解雇。"
    player "我会丢工作？！"
    player "我该怎么办？"
    goro "不是板上钉钉但需要格外努力证明这只是不会重犯的错误。"
    goro "如果完成很多工单在公司树立好名声，"
    goro "就能证明Iris看错了。"
    player "我会不惜一切真的。"
    goro "我知道你会的。"
    goro "这样如何？有几个客户演示要来做志愿者主持吧？"
    player "演示？包括什么？"
    goro "完成客户项目后通常展示刚完成的成果。"
    goro "带他们过一遍功能回答问题。"
    goro "通常让中级开发者做但如果你来做会展示你的责任心。"
    player "好应该能做大学经常演示不会差太多吧？"
    goro "接下来三周每周一个——明天新冲刺开始日期会公布。"
    goro "那时报名吧。"
    player "好的……"
    goro "……"
    goro "Iris看起来严厉但好意。"
    goro "我会跟她谈谈。"
    goro "我知道这算是灾难但……"
    goro "每个初级第一份工作都犯大错不知道她为什么这么生气。"
    show goro smile
    goro "第一个演示前我会指导你我知道你能行。"
    goro "同时尽最大努力好吗？"
    player "... Okay."

    scene bg company1_reception with blinds
    player "这是场灾难……"
    player "怎么修？也许就是不适合。"
    show maria with moveinright
    maria "不适合什么？"
    player "Oh."
    player "嗨Maria。"
    maria "怎么这么不高兴亲爱的？平时那么活泼……"
    "你跟Maria讲述今天的事她越听越难受。"
    maria "Ouch... "
    maria "看得出为什么压力大。"
    player "感觉搞砸了终于得到梦想工作现在别人再也看不起我了。"
    maria "……"
    maria @ smile "想看个酷东西吗？"
    player "好任何能让我忘记今天灾难的事。"
    "Maria邀请你到她桌前。"
    "她居然打开了一个终端？"
    player "什么……？"
    player "Is that..."
    maria @ smile "计算器！我自己做的！"
    player "你在编程！"
    player "从什么时候？！"
    maria "你来之前我常看开发者进出大楼都对项目很兴奋。"
    maria "大家做的东西听起来都很有趣不像我能做到的。"
    maria "直到遇见你走出自己的路自学编程。"
    maria "你第一天给我的鼓励真的激励了我从那时起利用空闲自学编程！"
    player smile "哇……太棒了Maria。"
    maria "你在这里产生影响给办公室带来正能量和善意因为我也因你改变。"
    maria "一切会好转——我就是知道！"
    player "谢谢Maria。"
    player "这个窗口是什么？看起来像外星文字。"
    maria "哦那个！"
    maria "照你推荐的逛freeCodeCamp论坛有人在说一种叫regex的东西。"
    maria "看起来奇怪复杂但开始玩后发现还不错。"
    player "真的？但看起来很难！"
    maria "见过一些超复杂的正则但即使很小的也很有用。"
    maria "有个用户说他们是公司唯一会用的人同事夸得不行！"
    maria "从过去工作中学到学会别人不愿做的事会让你成为抢手员工。"
    player "哦！"
    player "你是说学正则表达式能帮团队让自己不可替代？"
    maria "没人真的不可替代，"
    maria "但专注学强大技能就难被替代！"
    maria @ laugh "确保不影响工作任务我也犯过这个错。"
    player "谢谢Maria这一切。"
    player "这就是我需要的鼓励。"
    maria @ smile "你能行！"
    maria "需要倾诉或鼓励随时找我吃午饭好吗亲爱的？"
    player "谢谢！有编程问题也可以来找我！"
    maria "成交。"
    return

label v2_redemption:
    scene bg company1_center with fadehold
    play sound 'audio/sfx/office_ambient.wav'
    show mala
    mala "Goro, can you come over here for a second? I can't get this to work."
    show goro at left with moveinleft
    goro "I'm comin', I'm comin'."
    show oliver at right with moveinright
    oliver "Just a moment, Goro."
    oliver "帮完Mala后我需要跟你商量邮件——客户又打电话来了只能拖延这么久。" # Ed: Is Oliver writing back because the client called earlier? It's a bit unclear. Maybe it can be changed to something more general like "... - the client is reaching out again, and I can only put them off for so long."
    oliver "想确保跟他们说的是对的。"
    goro "没问题Darius可以在你忙时帮忙。"
    hide goro with moveoutleft
    show darius at left with moveinleft
    darius "等一下——写完这个查询马上来Oliver。"
    oliver "谢谢Darius。"
    "到办公室时整个团队看起来都很慌张。"
    player "Oliver, what's going on here?"
    oliver "嘿[player_name]我们这算是红色警报了。"
    oliver "Mala正要跟你吃午饭时收到了Zachery Clondike账户的邮件。"
    oliver "显然Kyle一个中级开发者休假前没提交客户网站的工作。"
    oliver "他赶飞机而客户网站今天截止。"
    player "Can't we just get IT to get into his computer and push it from there?"
    play sound 'audio/sfx/office_phone_ring.mp3'

    oliver "呃——等下我得准备告诉他们可能无法按时完成的笔记。"
    hide oliver with moveoutright
    mala "Not possible, small fry. Darius says he saw him leave WITH his laptop the day he started his vacation."
    mala "We checked his desk and couldn't find it anywhere."
    darius "I'm almost certain I saw him working on it earlier that day, too. He was just about done."
    mala "Kyle will sometimes go an entire sprint without pushing up his code. I remind him to do it constantly in case a situation like this comes up."
    darius "Mala, real quick - can you help me out with the UI?"
    mala "Sure thing - sorry [player_name], gotta go."
    hide darius
    hide mala
    player sweat "W-wait! How can I help? What else needs to be done?"

    show goro at left with moveinleft
    goro "There's lots to do. It's going to be all hands on deck cleaning this situation up."
    goro "This client makes and maintains several smaller pieces of software, and needs new landing pages and website built pretty often."
    goro "Occasionally, they even contract us to fix bugs on a product of theirs, or help getting a new piece of software over the finish line when they're short on developers."
    goro "They're a huge company, and have been a client of ours for a long time."
    goro "We've been putting off finishing this particular app for a while, which has delayed its launch quite a bit."
    show iris at right with moveinright
    iris "If we lose this client, a lot of money will go with them."
    player "Ah! H-hey, Iris. (SWEAT)"
    iris sweat "... We cannot afford to have them terminate our services."
    show iris -sweat
    player "（Iris居然……紧张了？）"
    player "（看来很严重。）"
    player @ smile "How can I help?"
    player "Maybe I should start with something that will take the longest or make the most amount of impact?"
    goro "Well, the product is a CRM, so it's pretty complex."
    player "CRM 客户关系管理"
    goro "A customer relationship management app."
    goro "It's used by companies that have sales departments."
    goro "There's quite a bit of detail work that needs to get done."
    goro "For one, the client wants the phone numbers to render in a specific format."
    goro "They need to have a parenthesis around the first three digits, a space after the parenthesis, then the next three digits."
    goro "Finally, the numbers need another space, a hyphen, one more space, and the last four digits."
    iris @ disgust "We could do something like that with regex..."
    goro "But Kyle was the only one here that knew how to use it."
    player "Regex? I've been studying regex."
    iris "Really? Can you fix this?"
    player "I definitely can! Give me a moment."
    play sound 'audio/sfx/keyboard_typing.wav'
    player "……"
    player "就是这样！"
    goro @ smile "Huh - that works!"
    goro "Good job [player_name]."
    player "What's next?"
    goro "Well, we have a few more tasks:"
    goro "We need to limit characters on a ton of different fields,"
    goro "and run a check in the backend to make sure that URLs entered by the user are valid. It saves the sales agents time when they can send them to clients knowing they work properly."
    player @ surprised "Seriously?"
    player @ laugh "Regex can handle all of that too!"

    scene bg company1_center dusk with dissolve 
    "你一个个处理Oliver提交的问题工单。"
    "不知不觉项目又恢复运转了。"
    show oliver
    oliver "天啊！"
    oliver "我觉得我们做到了大家。"
    oliver "不完美但产品发布时很少完美的。"
    player "Is it good enough to be released to the client?"
    oliver "绝对是！最低要求已满足。"
    oliver "那足够交回给客户了。"
    oliver "Kyle下周休假回来可以把走前完成的额外功能加进去。"
    show darius at right
    darius "Ugh - I'm so TIRED."
    show mala laugh at left
    mala "Yeah... that was exciting and everything, but..."
    mala sweat "I never want to be excited under these circumstances again."
    hide mala
    show goro at left
    goro @ laugh "You and me both. Great job, team!"
    goro @ smile "I think some special thanks are in order for [player_name] as well."
    darius @ laugh "Seriously! I obviously need to learn some regex myself!"
    hide oliver
    hide darius
    hide goro
    "大家收拾东西开始离开办公室回家好好休息。"
    "正要离开时Iris叫住了你。"
    show iris
    iris "[player_name]. Just a moment."
    player "（哦不……以为今天做得很好？搞砸了吗？）"
    player "是……是的？"
    iris "……"
    iris @ smile "今天做得好。"
    iris "你超出了我的预期。"
    player "……"
    player smile "（Iris……对我笑了！）"
    player "很高兴能帮上忙！"
    iris "也许我之前暗示招聘你是错误决定有点苛刻了。"
    iris "明天早上能来我办公室吗？"
    iris @ smile "想跟你谈谈。"
    player "哦好的没问题。"
    iris "快回家休息吧。"
    player "会的。"
    "因用正则技能挽救局面获得20声望。"
    $ player_stats.change_stats(RENOWN, 20)
    return

label v2_paying_it_forward_p1:
    scene bg company1_boardroom with fadehold
    play sound 'audio/sfx/knocking.mp3'
    show iris
    player "U-um Iris? I'm here."
    player "You said that you wanted to see me?"
    iris "……"
    player pout "(Oh no... have I managed to upset her somehow between yesterday and today?)"
    iris "[player_name]... can you tell me about your previous position?"
    player "My... previous position?"
    player "You mean before I became a developer at ConsultMe?"
    iris "是的。"
    player "Well... I used to be a tutor."
    player "I tutored students from elementary to high school, basically."
    player @ smile "The elementary students were probably my favorite, though!"
    iris "I see. Did you like your work?"
    player "……"
    player @ smile "I did. I even miss it sometimes."
    iris @ confused "Oh? Why is that?"
    player "For a lot of the other tutors, it was just a job."
    player "But for me, I saw it as a really special invitation into a pretty personal part of my students' lives."
    player "I wasn't always the best student myself when I was in school. But I had a teacher that really, really believed in me."
    player "I needed money after college, so when I saw a job posting for the position, I realized that this could be a chance for me to have a similar role in the lives of other students."
    iris "Interesting."
    iris "Did you ever have a student that was... PARTICULARLY hard to teach?"
    player "Sure! But that was never a reason for me to quit."
    player "Those students needed me the most. There was one student that I remember the most clearly."
    player "He had a learning disability. I've had students in the past with learning disabilities, but this student had a few."
    player "His dyslexia and ADHD seemed to give him the most trouble."
    player "When he first came to the tutoring center, he was nearly failing his grade."
    player "He was really afraid that he'd need to repeat a year. He always brought up his mom, and how he didn't want her to worry about him."
    iris "……"
    player "What I loved most about tutoring is that I could give my students this sense of power."
    player "They'd come in, completely believing they were powerless against math, or writing, or social studies. But once we were done, they'd proudly show me their good grades."
    player "With this student, I was particularly determined – I used to struggle with my ADHD, too."
    iris "You have a diagnosis?"
    player "Yep! Mom and Dad found out when I was 10."
    player smile sweat "I really, really used to struggle paying attention in class and getting my schoolwork done. My grades were pretty bad, just like my student's."
    iris "... how did you overcome it?"
    player -sweat "Well, ADHD never really goes away, but I was able to cope and make things work for myself thanks to that teacher I mentioned earlier."
    player "She taught me how there are many, many ways to learn, and that all I had to do was find the way that worked best for ME."
    player "Some of my students were great at memorizing from long pieces of text."
    player "Others weren't great at retaining written information, but did really well when they were given videos."
    player "Sometimes those only helped a little, so I'd find games to teach what they needed to know."
    player "For my student, it meant using a combination of those things."
    iris "……"
    iris @ smile "And did you ever find anything that worked for Isaac?"
    player @ smile "我们做到了！"
    player @ laugh "It was so cute, watching his expressions change each tutoring visit, from bringing in D's, to C's, to eventually B's and A's."
    player @ smile "I'll never forget the day he came with his first A, telling me how proud his mother would be..."
    player "……"
    player "... how did you now his name?"
    iris "……"
    iris "我有时感到愧疚。"
    iris "我差点自己都不相信他了。"
    iris "我刚在ConsultMe开始当经理从高级开发者转来在适应更长的工作时间。"
    iris "感觉被各方面拉扯刚开始陪他的时间少了。"
    iris "大概那时他的成绩开始下降。"
    iris "他需要帮助但同时公司刚起步ConsultMe也需要我。"
    iris "所以我做了最后的办法：让他课后去辅导。"
    iris "我是个走投无路的单亲家长只能相信辅导中心的老师。"
    iris "……"
    iris @ smile "……谢谢你在连我都找不到理由时还相信我儿子。"
    player "等等……你是Isaac的妈妈？！"
    player "但你是面试我的人！"
    player "所以你早就知道——"
    iris "从第一天就知道你是谁？没错。"
    iris "有很多不错的候选人来应聘这个岗位。"
    iris "但你打败了至少3个有正规学历的开发者。"
    iris "最后剩你和另一个开发者技能和面试分数几乎一样。"
    iris "……我不喜欢裙带关系但我知道必须选你。"
    iris "我已经见过你专注时能做到什么。"
    iris @ smile "经过一些说服但你也知道我们选了你。"
    player "回头想想这就说得通了。"
    player smile sweat "感觉我的人际面试砸了太紧张了！"
    iris "你技术面试时确实紧张。"
    iris "But then I remembered how Isaac would come back to the car, beaming about the “nice teacher lady” that helped him each day. (SMILE)"
    iris "I listened outside of the door for a few sessions to hear you work your “magic”, as he called it. So I knew what you REALLY sounded like when you were confident in what you were doing."
    iris @ disgust "说实话你的热情很感人但变得马虎了。"
    player "（好嘛又回到正常的Iris了。）"
    player pout -sweat "……"
    iris @ smile "……让我想起我当初级时的自己。"
    iris "我终于可以放心离开了。" # Ed: Maybe "move on" instead of "take my leave"?
    player @ surprised "……离开？你要辞职吗？"
    iris "是，收到了无法拒绝的offer。"
    iris "今早提交了两周通知。"
    player "（但……我们才刚开始互相理解她就要走？）"
    iris "当然……我们不必停止合作，如果你想一起来的话。"
    player "什么？跟你去新公司？"
    iris "对我和老同事一起管理。"
    iris "我一直在跟她说你的事，她想面试你她公司Spaghetti Code的初级DevOps岗位。"
    player "DevOps？但我对DevOps一无所知……"
    player "等等——我以为我在PIP？！"
    iris "没有PIP。"
    iris "只需要你提高工作质量。"
    iris "说实话如果觉得你需要PIP我会邀请你一起去新公司吗？"
    iris "我同事也知道你是初级她本来想自己招人但说相信我对人选判断。"
    iris "如果你感兴趣我做了几个模拟DevOps工单让你了解基础。"
    iris "当然你完全可以说不要……"
    player "……"
    player "我不确定会不会又让你失望……"
    iris "我不喜欢经常夸人因为觉得会失去意义，"
    iris "但你是好开发者[player_name]到目前为止做得很好。"
    iris "如果我从你身上学到什么就是当你相信自己——"
    iris "——或别人——"
    iris "能学会什么你就去做看看你走了多远？自学了编程。"
    iris "你能做到。"
    iris "工单完成后到我办公室来进行下一步。"
    return

label v2_paying_it_forward_p2:
    scene bg company1_boardroom with fadehold
    show iris
    iris "……"
    player "我完成了DevOps工单。"
    iris "……我看到了。"
    iris smile "要给我同事打电话吗？"
    player smile "我想是的。"
    scene bg company1_lydia_cubicle with fadehold
    "（那周你在Spaghetti Code经历了三场严格面试。）"
    "（屏息等待招聘人员的邮件通知你是否拿到职位。）"
    scene bg living_room with fadehold
    "（收到offer时父母无比骄傲你按Iris教的故作冷静请求一天时间考虑虽然差点掩饰不住兴奋。）"
    scene bg company1_lydia_cubicle with fadehold
    "（第二天早上你签字并在ConsultMe提交了两周通知。）"
    scene bg company1_center with fadehold
    "（全团队为你们离开惋惜但Goro一定告诉你他有多骄傲。）"
    scene bg company1_reception with fadehold
    "（最后一次经过前台离开ConsultMe时你意识到有段时间没见到Maria了。）"
    "（也许她也去了更好的地方。）"
    scene bg bedroom with fadehold
    "（接下来三周缓慢过去你交替学习新岗位知识和好好休息。）"
    return

# start of home stories
label v2_email:
    player relieved "Phew - I'm so glad to be home!"
    player smile "I got a lot done today. But now that I think about it, I don't think that I got to check any of my emails. I should probably do that before I relax."
    player neutral "Meeting invite... "
    player "Office birthday party..."
    player "Hm... an email from the payroll department? What's this about?"
    player "“To whom it may concern,"
    player "“Our payroll system has experienced a privacy breach at 10:27AM today. To ensure your private information is safe, please click the link below to reset the password to your payroll account."
    player "We deeply apologize for the inconvenience.”"
    player @ pout "Wow! That'd really stink if someone got a hold of my password! What should I do?"

    $ found_problem = False
    menu mysterious_email_choices:    
        "Re-create my password":
            player "I'd better quickly re-set my password before my data is compromised! It looks like they'll need me to log in first."
            player "……"
            player worry "Strange... The site just keeps loading. Did I do something wrong? Maybe I should refresh."
            player "……"
            player surprised "Oh! I just got an email from our Security Department. Maybe this can wait. I'd better open it."
            player "“Good evening,"
            player "You have failed a routine ConsultMe phishing test. Please email your supervisor no later than 11AM tomorrow to schedule a mandatory security training.”"
            player "What? Phishing? What is that? And why do I need to report for additional training?"
            player "I should look this up."
            player "Okay, here we go - Phishing"
            player "“The fraudulent practice of sending emails pretending to be from reputable companies in order to trick individuals into revealing personal information, such as passwords, credit card numbers, and other private information.”"
            player "Oh no... this means that if this was a real phishing attempt, I would have given away company information. Who knows what a cyber attacker could have done with my data?"
            player "I've got to be more careful in the future. Giving away that kind of information could probably lead me to losing my job, or even compromising my financial information."
            player "But how do I tell a phishing email from a real email? Maybe I should look that up too."
            player "……"
            player "Interesting - it says here that phishing can be detected in a few ways. You can check the sender to ensure that the extension on their email matches the company's professional email."
            player "You can also check the presence and quality of a company logo, and, most importantly, not click any links or attachments in the email unless you're sure of where they're coming from. "
            player "On most computers, you can hover your mouse over the link, and your computer should tell you where they lead to in a tiny window."
            player "I guess I've got to face the music tomorrow. Iris is not going to be happy about this..."
            "You lose 10 Renown. You should be more careful!"
            $ player_stats.change_stats(RENOWN, -10)
    
        "Check the sender's email":
            player "Come to think of it, did this really come from the payroll department? I just ran into Ryan from Payroll during lunch, and he didn't say anything about this."
            player "……"
            player @ surprised "(Gasp!) ryanwebster@ajflke.net... Weird - This isn't a ConsultMe Consulting company email! Ryan Webster does work for the Payroll department, but the end of his email should be @goodvibes.com."
            player "But what does that mean? Should I still go ahead and re-create my password?"
            $ found_problem = True
            jump mysterious_email_choices

        "Inspect the logo":
            player "Before I re-create my password, I should probably make sure that this email has our company branding."
            player "……"
            player "“CompanyNamme”? An email from our company wouldn't have our company name misspelled... And this logo is so small that I almost missed it!"
            player "Plus it's all blurry and pixellated. The logo on all of our other company emails is usually colorful and crisp-looking. It's almost like someone took a screenshot of the logo and used it here."
            player "Hm... should I still re-create my password?"
            $ found_problem = True
            jump mysterious_email_choices

        "Check the domain name":
            player "Like the email says, there's a hyperlink to reset my password. But where does it go?"
            player "I should probably hover over the link before clicking it. It's not good to follow links without knowing where they lead."
            player "……"
            player worry "Weird! Our company URL is ConsultMe.com, so our reset link should be something like ConsultMe.com/password-reset. This link leads me to company.name.co/pssword-reset."
            player "The links look the same, but they definitely aren't - this link has dots in-between the words in the title of our company."
            player surprised "That feels pretty sneaky!"
            $ found_problem = True
            jump mysterious_email_choices

        "Something's not right here..." if found_problem:
            player worry "Something's not right here. Now that I think about it, I remember our security specialist telling me about a report button in my email software when I first started. I'll report this email to the Security Department."
            player "……"
            player @ surprised "Oh! Another email? And it's from the Security Department! I'd better open it."
            player neutral "“Congratulations! You've passed a routine ConsultMe phishing test. Your vigilance is appreciated and helps keep our company safe from cyber attacks and security vulnerabilities.”"
            player worry "Phishing? What's that? Are they talking about the password reset email?"
            player neutral "I'd better look this up."
            player "……"
            player "Here it is; Phishing - “The fraudulent practice of sending emails pretending to be from reputable companies in order to trick individuals into revealing personal information, such as passwords, credit card numbers, and other private information.”"
            player surprised "Oh! So ConsultMe must perform these to make sure that we're staying on our toes about our company's private information! I'm glad I listened to my gut!"
            player "Interesting - it says here that phishing can be discovered in a few ways. You can check the sender to ensure that the extension on their email matches the company's professional email."
            player "You can also check the presence and quality of a company logo, and, most importantly, not click any links or attachments in the email unless you're sure of where they're coming from. "
            player "On most computers, you can hover your mouse over the link, and your computer should tell you where they lead to in a tiny window."
            "因敏锐眼光获得10声望。"
            $ player_stats.change_stats(RENOWN, 10)
    return

label v2_venting:
    player "（叹气）"
    show mint
    mint "喵！"
    player "Hi Mint. Am I ever glad to see you! I had a rough day at work today."
    mint "喵？"
    player "A client complained to Iris today that I didn't complete a task the way that they asked."
    player "They told me that they wanted a custom API built for their project, even though I told them it was a bad idea. It would take the team an extra week if we did it that way instead of just using a public API. "
    player "It would cost them less money, too."
    player "I told the client this, and now we're 3 days into the project and they're demanding that we finish faster."
    player @ worry "I'm just so frustrated..."
    hide mint
    mom "[player_name]! [player_name], what's wrong honey? Are you upset about something?"
    player "（嗯……我不开心，跟妈妈聊聊通常会好点。）"
    player "（也可以发到我最爱的Web开发论坛，看到好多人都在那抱怨工作。）"
    player "（也可以打给Annika看她有什么建议。）"

    menu:
        "Vent to Mom":
            player "Yeah! I'll talk to Mom. She's a great listener, and super supportive. I'll talk to her about it."
            mom "Hi [player_name]! You sounded upset when you were talking to Mint. Did she get into your cookies again?"
            player "Haha! No, but that sounds like something Mint would do!"
            player "I just had a rough day at work. "
            mom "Want to talk about it sweetheart?"
            player "Well, there's this client that wants a custom service added to their website and building it from scratch is going to take around a week."
            mom "I see. So you can't program one?"
            player "I can. It's just that things would go much faster if they used an API, and -"
            mom "An API? What's that?"
            player "!"
            player "Uuuuhh... So, an API stands for “Application Programming Interface”."
            mom "Oh... I see. So it's like a website?"
            player "No, not quite. I mean... websites use them, but..."
            "You and Mom go back and forth like this for a while, and after an hour of trying to explain API's and CRUD requests to her, you decide to call it a night, more frustrated than you were when you got home."
            "原来分享工作故事需要一定专业知识才能聊。"
            "Posting to one of your favorite development forums would have accomplished this, but what if someone from your job or even one of your clients saw it?"
            "You sigh. You probably should have called up Annika. She's a developer, but you also know her personally, and there'd be very little risk that what happened at work would be shared outside of just the two of you."
            "因试图解释HTTP错误码头疼失去15精力。"
            $ player_stats.change_stats(ENERGY, -15)

        "Vent to Annika":
            player "I think I'll talk to Annika. She's one of my only friends that completely understands the work I do. I'll talk to her about this."
            window hide
            show smartphone at truecenter
            play sound "<to 2.0>audio/sfx/phone_ring.wav"
            play sound "<to 2.0>audio/sfx/phone_dial_tone.wav"
            pause 2.0
            hide smartphone

            show annika
            pause 1.0
            annika "嘿责任伙伴！怎么了？"
            player "嘿Annika有空吗？"
            player "今天过得最糟了。"
            annika "哦不！怎么了？同事问题？"
            player "不更像是客户问题！有客户要往网站加定制服务从头构建要一周。"
            player "有没有API能帮你做这个……？"
            player "我就是这么说的！但听我说……"
            "你和Annika聊工作的事她完全理解，她团队里也有类似的项目经理问题。"
            "跟她聊完感觉好多了，最后挂电话时感到轻松。"
            player "很高兴能跟Annika聊问题，跟同为程序员的人聊工作真好。"
            player "我爱妈妈但感觉稍微详细讲她就听不懂了。"
            player "I'm glad I cooled my head and spoke to Annika instead of going to the internet too! Annika told me about a friend of hers that did that, and one of her managers found her complaining on a popular forum! "
            player "想到Iris发现我抱怨客户太可怕了……"
            "向朋友倾诉获得10精力，感觉好多了！"
            $ player_stats.change_stats(ENERGY, 10)

        "Vent Online":
            player "Right, I'll just solve this the way I solve all my other problems - bringing them to the internet! The users on my favorite web dev forum will understand how I feel."
            "You post in one of your favorite, popular web development forums. "
            "用户们确实很理解，有的甚至给了未来处理这类客户的建议。"
            "All is going well until one of the users checks your post history, and doesn't guess your exact company, but makes a close guess at another consulting company only a few miles away from yours."
            "开始出汗，猜对了怎么办？认识客户怎么办？"
            "开始担心连客户都能在这个公开论坛找到你？"
            "You think to yourself that if you just talked to Annika, a developer that you know personally, this could have been much better."
            "You wouldn't have to be as worried about your identity on the internet being discovered, or a client seeing you vent."
            "You quickly delete the post, hoping that only a handful of people saw it. "
            "因压力失去10精力。"
            $ player_stats.change_stats(ENERGY, -10)
    return

label v2_running_late:
    player "……"
    show mint
    mint "喵！"
    player "Ngggh..."
    player "喵！"
    player "Ugh... What IS it Mint?"
    player "5 more minutes..."
    mint "梦幻"
    player "……"
    player @ surprised "Oh my gosh!"
    player "Mint, is that really what time it is? I'm running late!"
    player "The office opens around 8AM, and I'm typically encouraged to arrive between then and 10AM."
    player "Right now, it's 9:20AM!"
    player "I've got to get ready!"
    "快速穿好抓起电脑包和厨房苹果。"
    player "Okay, that's everything..."
    player "It takes around 20 minutes for the bus to get to work, and maybe 20 minutes to walk there."
    player "I could probably make it if I run!"
    mint "……喵？"
    player @ pout "Mint, don't look at me like that..."
    player "I want to make a good first impression my first few months at my first job. I shouldn't be getting there late! "
    player "I could maybe make it if I rush!"
    player "I mean... what else can I really do other than that?"
    hide mint

    menu:
        "Run to the bus stop. You can probably make it!":
            if renpy.random.random() < 0.3:
                player "Okay... okay, I'm going to go for it! I'm sure that I can make it. "
                player "Like I said, I don't want to make a bad impression."
                player "This will be a little more stressful, but I can do it!"
                "You run to the bus stop, making it there in your projected 10 minutes, and just as the bus is arriving!"
                "The bus takes about as long as it usually does to get to the office."
                "You forgot to account for just how long it takes to get to your department from the bus stop and the building's entrance,"
                "But a few more minutes doesn't quite hurt you."
                "10:35到了能听到休息室里团队聊天的声音。"
                "It seems that Jenna, the office assistant, has surprised everyone with donuts again."
                "听了一会听到Iris声音也松了口气。"
                "利用这个分心悄悄溜到工位没被发现。"
                "不想养成习惯，虽然按时到了但代价呢？"
                "因疯狂冲刺失去5精力。"
                $ player_stats.change_stats(ENERGY, -5)
            else:
                player "Okay... okay, I'm going to go for it! I'm sure that I can make it. "
                player "Like I said, I don't want to make a bad impression."
                player "This will be a little more stressful, but I can do it!"
                "跑到公交站赶上预计的10分钟！"
                "However, there's a factor that you didn't plan for - the bus is 20 minutes late getting there."
                "You ask the driver what was going on when he arrives. He explains that there were two traffic jams on the highway to your neighborhood."
                "To make things worse, the bus also catches a flat halfway to your job."
                scene bg company1_center with fadehold
                "By the time you arrive at work, it is 12:00PM. Iris does not seem pleased."
                show iris
                iris "很高兴你真的来了。"
                player sweat worry "*喘*……*喘……*"
                player worry "我……*喘*……抱歉！"
                player pout "公交比平时久得多……然后轮胎……*喘*……"
                player -sweat pout "公交一到我就一路跑到我们部门大楼和楼梯。"
                player "比电梯快多了。"
                iris disgust "然而……你还是迟到了。"
                player "抱歉……"
                iris neutral "你应该给我或团队发消息为什么那不是你做的第一件事？"
                player sweat pout "（首先你太吓人了！）"
                player smile sweat "只是觉得让大家不高兴可能失去尊重？"
                iris disgust "所以你觉得浪费半天赶到办公室是合理利用时间？"
                iris "你带工作笔记本了吗？"
                player -sweat "是……"
                iris "（叹气）那你也可以在家工作。"
                player "我可以什么？"
                iris "我通常建议初级尽量来办公室开始多跟团队在一起有好处。"
                iris "我觉得初级这样学得更多。"
                iris "但偶尔条件需要时我完全同意你在家工作。"
                player "所……所以我不需要急两个小时？"
                iris "没错。"
                iris "请到你的工位有不少工作要补。"
                "因非常迟到失去15声望。"
                $ player_stats.change_stats(RENOWN, -15)
    
        "在TeamChat上告诉团队你要迟到。":
            player "不想迟到但按目前速度可能会。"
            player "如果公交晚了我到站时还没来呢？"
            player "而且路上有什么事挡住呢？"
            player "现在想想还没考虑从大门到部门的时间！"
            player "想起来昨天下班看到电梯在维修。"
            player "部门在5楼！真能几分钟冲上楼梯吗？"
            player "……"
            player "好就在TeamChat上跟Goro说要晚点到。"
            player "……"
            player "……"
            player "……哦！他回了。"
            player "“Sorry to hear that we won't be seeing you in the office this morning like we usually do.”"
            player "“Our office assistant, Irene, even surprised us with donuts today!”"
            player "糟！我爱甜甜圈，到的时候肯定没了。"
            player "……"
            player "……什么？他是认真的吗？"
            player "“How long will it take you to get here? 30 minutes? An hour?”"
            player "“Why don't we just make things easy and you can work from home this morning? If you want to come in after lunch, that's fine with the team.”"
            player "Mint……你听到了吗？！我可以早上在家工作下午再过去！"
            mint "喵！"
            player "我可以在这里跟你在一起！可以在房间沙发上甚至阳台工作！"
            player "太酷了……"
            player "好！既然在家就做比苹果更好的早餐吧！来Mint！"
            "因能在熟悉舒适环境工作获得5精力。"
            $ player_stats.change_stats(ENERGY, 5)
    return

label v2_family_business:
    mom "欢迎回家亲爱的！"
    player smile "Hi Mom! Is dinner almost ready?"
    mom "快了——但听这个："
    mom "早些你表妹打电话来，我跟你阿姨说了你工作做得多好，"
    mom "她跟你表妹说了。"
    mom "你表妹开始学Python决定也要成为软件开发者！"
    player "Wow! Isn't she only a teenager?"
    mom "是啊！她说想为未来抢先一步。"
    mom "今晚能给她打个电话吗？"
    player "Sure! I remember when I was trying to make that decision, too."
    player "I'll talk over all of her options with her."

    scene bg bedroom with fadehold
    "那晚晚些时候……"
    show smartphone at truecenter
    play sound "<to 2.0>audio/sfx/phone_ring.wav"
    play sound "<to 2.0>audio/sfx/phone_dial_tone.wav"
    pause 2.0
    hide smartphone

    show josephine smile
    pause 1.0
    josephine "……你好？"
    player smile "嘿Josie！最近怎样？"
    josephine "你好表姐/哥[player_name]，我很好。" # Ed: Is cousin a title here? Maybe a cultural thing?
    josephine "听说你在理想领域找到了工作，恭喜。" # Ed: This seems overly formal for family, but maybe it's Josie's character trait?
    player "嘿谢谢！路很长但完全值得。"
    player "打电话因为妈妈说你也想做同样的事？"
    josephine "是的。"
    josephine "Last year, I completed my senior year of high school, and –"
    player "什么？！你完成了？高中？"
    player "我以为你才15岁？"
    josephine "其实是16岁。"
    josephine "决定休学一年，去旅行。"
    player "对……对……"
    player "天哪听说你是天才但这太酷了！"
    player @ laugh "我为你骄傲。"
    josephine blush "谢谢，也没那么了不起……"
    josephine -blush "你说佩服我，但我才佩服你。"
    josephine "妈妈说了你如何制定计划追求未来，即使缺乏正规培训。"
    josephine "所以我决定开始学Python，没想到这么有趣！"
    josephine "虽然做小项目很有趣但不知道从哪里开始做职业化。"
    player sweat smile "职业？你……你不想太年轻考虑就业吗？"
    josephine "为未来努力永远不早！我想成为强大的职场人，提前开始就在我的五年计划里。"
    josephine "完成时我就18岁了所以可以工作。" # Ed: If Josie is 16, then she'll be 18 in 2 years, not 5. Unless she started her 5 year plan earlier? Maybe it'd be better to say that she'll be over 18 by the time she's done, so she can work?
    josephine "总之我知道大学是选项但也读到可以自学很多？"
    josephine "Which brings me to the biggest question I want  answered: Which path should I take?"
    josephine "我父母想讨论资金和时间投入。" # Ed: Do Josie's parents want to discuss financing and a timeline because they expect her to go to college? Or because they want to help her with her 5 year plan and are supportive of that? Maybe it would be better to say something like "My parents want me to explore my options, and find out how much time and money will be involved."
    player sweat smile "Are they aware of your... um... “5 year plan”?"
    josephine "……"
    josephine blush "妈妈和爸爸想让我快乐。"
    josephine "他们是了不起的父母，即使不理解也一直支持我的追求。"
    josephine "我想让他们快乐。"
    josephine "我想让他们为我骄傲。"
    player laugh -sweat "不如我们看看选项聊聊哪个最适合你？"
    josephine -blush "谢谢表姐/哥[player_name]！你最好了。"
    josephine "我有什么选项？"

    default v2_family_business_choices_visited = set()

    menu v2_family_business_choices:
        set v2_family_business_choices_visited

        "Computer science degree":
            josephine "哦对！爸爸跟我说了大学的事还在附近找到一所如果走这条路能上的。"
            player "对！据我了解计算机科学有四年制学位。"
            josephine "为什么大学不直接叫编程学位？"
            player "因为不特指编程学位。"
            player "编程肯定是课程一部分但计算机科学是包罗万象的学位。"
            player "学计算机历史、底层原理和很多其他东西。"
            player "还涉及很多数学。"
            josephine "呃。"
            josephine "我数学好是好……"
            josephine "但还是讨厌。"
            player "我也不喜欢高等数学！"
            player "但在这个领域某些工作真的很有用。"
            player "幸好大多数工作基本不需要数学。"
            player "而且如果有大学学位能谈到比我高得多的起薪！"
            josephine "好……计算机科学学位要花多少钱？"
            player "很大程度上取决于去哪所学校在哪个国家。"
            player "比如在美国一些社区大学有政府援助相当实惠。"
            player "But state and private universities might get really expensive."
            josephine "I see... so I could learn a lot, and a degree will help me get a higher salary in the beginning of my career,"
            josephine "but it could be very expensive."
            player "That's right. It's a lot to think about!"
            player "Something else that's cool to consider, though, is that some jobs will pay for you to go to college."
            josephine "... That doesn't make any sense. I can go to college AFTER getting hired? Isn't a college degree what will help me get hired in the first place?"
            player "It sounds silly, but sometimes companies need you to learn something specific. They'll pay for college classes so you can learn that specific thing well."
            player "And sometimes companies will pay for your whole degree! It's a way of investing in their employees."
            josephine "I see... so it may be possible for me to learn to program on my own, get a job, then attend college for free?"
            josephine "Which will help me negotiate higher pay in future positions?"
            player "That's right! It's another route that you can take instead of going straight into college."
            jump v2_family_business_choices

        "Software engineering associate's degree":
            josephine "... Isn't this just a computer science degree?"
            player "Not quite!"
            player "In a software engineer associate's degree, or a web development associate's degree, you study the specific skills you need for those positions."
            josephine "Gotcha. How long does it take?"
            player "An associate's degree is usually only 2 years! So you can finish a lot faster."
            player "Associate's degrees are usually more affordable, too."
            josephine "Hm... that fits right into my 5 year plan~"
            player sweat smile "You and that 5 year plan again..."
            jump v2_family_business_choices

        "Self-teaching":
            josephine "So... Mother says that you taught YOURSELF how to program?"
            josephine "What's THAT like?"
            player -sweat laugh "It was a lot of hard work!"
            player "Though, to be fair, however you learn programming, it's going to be a lot of hard work..."
            player "But self-teaching worked best for me."
            player "I had a part-time job at the time because I needed to pay my bills, but also needed time to study."
            player "I found this awesome online community that with lots of people to help me out. It has lessons on almost anything you can think of that involves programming."
            player "The best part is that it's free!"
            josephine "That sounds pretty cool! What was hard about it?"
            player "Definitely having the discipline to keep on studying."
            player "There were so many times that I wanted to quit. And nothing was stopping me."
            player "What helped was keeping my goal in mind, and spending time with other people who were on the same path as me."
            player "The users on the forums I hung out in were really helpful about staying motivated. And I made a lot of cool friends!"
            josephine "Wow... so what's the name of this resource?"
            player "I learned to code on freecodecamp.org!" # Ed: Would it be better to use the name freeCodeCamp here rather than the URL?
            josephine "I'm writing this down. I may need to spend a bit of time there tonight."
            player "I think that's a GREAT idea! It's a good thing to do, even if you end up going with a different option to learn."
            player "They have so many different lessons there, so you can get a good idea of what kind of programming you'd like to learn for work."
            player "That's another great thing about freeCodeCamp - one of the hardest parts of teaching yourself to program, aside from self-motivation, is not knowing what to study."
            player "It's super easy to lose a few weeks or months on languages or technologies that aren't right for the kind of work you want to do."
            player "freeCodeCamp actually has entire tracks and learning paths carved out for you so you know exactly what to study."
            player "And, if you ever decide you want to go the self-taught route and aren't sure about what to focus on, you can always give me a call."
            josephine "Thanks [player_name] - that's so sweet!"
            player "What is family for? I'm so proud of you for thinking about your future!"
            jump v2_family_business_choices

        "That's about it!" if len(v2_family_business_choices_visited) > 1:
            pass

    player "So did that help at all?"
    josephine "It definitely did! I think I have a better idea of what some of my options are."
    josephine "Mom and I are going to have a lot to talk about. Graduation is only a few weeks away!"
    player "Oh jeez! It seems like we talked at the perfect time, then."
    josephine "Thanks again [player_name]. This is all really, really scary."
    josephine "It almost doesn't seem real that I'm about to start making decisions for my future."
    josephine "Especially programming. It's new and exciting, but I'm not sure if I'm ready to do this on a professional level."
    player @ laugh "吧唧吧唧"
    josephine "……"
    josephine "What's so funny? I'm spilling my guts to you here."
    player "It's just so funny."
    player "Because I said the SAME THING when I first started learning!"
    josephine "真的吗？"
    player "Yep! And it's just a little silly to think that I'm telling you what someone else told me."
    player "And that one day, you'll probably be telling a newbie the same things, because they'll feel the same way."
    player "But as long as we keep lifting while we climb, we'll all be okay."
    player "I'll be here supporting you, whatever you decide to do."
    josephine "... Thanks [player_name]."
    player "没问题！"
    "You're so proud of your cousin! You gain 5 Energy from the nostalgia you experience from talking to a potential new developer."
    $ player_stats.change_stats(ENERGY, 5)
    return

label v2_fresssh:
    player "I'm home everyone!"
    player "Now that I'm back, I can check my favorite Greddit group, the LearnProgramming forum!"
    scene bg bedroom with blinds
    show mint
    mint "喵？"
    hide mint
    player "People like to help each other out with programming problems that they have."
    player "Sometimes, they even post articles and news about updates in programming languages or other new, cutting-edge technologies!"
    player "Hm... what's this?"
    player "Users Surfer90210 and BroDoYouBingBong are talking about some technologies I've never heard of?"
    player "Hm... I see..."
    player "According to BroDoYouBingBong, all developers should know how to use BingBong at least a little..."
    player "And Surfer90210 is talking about a new framework called Fresssh. Why so many S's?"
    player "Looking them up, both of these seem so cool. Maybe those two are right, and these technologies are the future..."
    player "Plus, I can tell Goro all about them, and maybe we can start using them!"
    player "On the other hand, I heard Goro talking about how on our next project, we're going to be using something called Material UI."
    player smile "Maybe I need to learn something like that so I can really help out the team."

    menu:
        "Learn about BingBong technology and Fresssh.":
            player "好的，"
            player "So it seems that a lot of people can't seem to agree if BingBong is going to be a big deal or not..."
            player "But Fresssh seems pretty cool! Following this tutorial, I managed to make a tiny application."
            player "I bet we can find lots of places to use this at work."
            player "I should message Goro and tell him about what I learned!"

            scene bg laptop_screen night with blinds
            play sound 'audio/sfx/social_media_notification.wav'
            show goro smile
            goro smile "Hey [player_name]! Staying at the office a bit late?"
            player smile "No, I just got back home!"
            player neutral "So I was on this forum that I really like, and I read about some users talking about BingBong, as well as this new framework..."
            "You send over pictures of the small webpage that you made using Fresssh."
            "You also explain how you think that it and BingBong could be really useful to the team."
            goro "That's really cool that you're doing research during your free time."
            goro "It's definitely something that good developers do."
            goro "Unfortunately... I don't think that these technologies will be really useful to us."
            player "Aw man, really? Why?"
            goro disgust "For one, Fresssh, even though it seems pretty cool, is super new. "
            goro "Like, it's fully-released version came out about 6 months ago."
            player @ surprised "Six MONTHS ago?"
            goro "Yes. Which means that there's barely any documentation on it."
            "You do a quick Schmoogle search and sure enough, the only documentation you can find on Fresssh is on the official documentation page and Fresssh's Youtube channel."
            goro "What happens if you need to debug something? What if there are some bugs that even the developers of the framework haven't figured out or noticed yet?"
            goro "There doesn't seem to be any communities surrounding this online yet either."
            goro "Companies tend to pick frameworks that have been around for at least a little while for these reasons."
            player "明白了……"
            goro "Similarly, BingBong hasn't been adopted by many major companies either."
            goro "We could certainly use it, but there are far, far fewer BingBong developers than, say, Ruby on Rails developers."
            goro "If the client ever needs help in the future to fix a bug in the system we built, and we're not the ones to do it, how will they find people that can do it?"
            goro "Does that make sense?"
            player pout "It does. I'm sorry!"
            goro "No need. This is a learning experience."
            goro "Just understand that in the future, as you develop your skills as a junior, you'll generally want to stick with popular technologies."
            goro "Once you've gained your footing in this field, you should feel free to venture off the beaten path. The sky will be your limit!"
            goro "But for now, we need you down on the earth with us, okay?"
            player "Okay. I understand..."
            "You lose 10 Energy from the realization that after studying these two frameworks, you won't be able to use them any time soon."
            $ player_stats.change_stats(ENERGY, -10)
    
        "Learn a little bit about Material UI.":
            player "好的……"
            player "So according to my search results, Material UI is something called a component library."
            player "It's got lots of pre-built visual components like slide carousels and navbars."
            player smile "So I guess we're going to be using this on our next project's frontend!"
            player "It'll probably make building a frontend even faster, not having to do anything from scratch!"
            "You spend a little bit of time on a Material UI tutorial, and before you know it, you've whipped up a little mockup."
            player "Using this at work will be pretty straightforward."
            player "I should message Goro and tell him about what I learned!"

            scene bg laptop_screen night with blinds
            play sound 'audio/sfx/social_media_notification.wav'
            show goro smile
            goro "Hey [player_name]! Staying at the office a bit late?"
            player "No, I just got back home!"
            player "I looked up Material UI. It looks like a lot of fun!"
            player "I even did a tutorial, and made something really quick!"
            goro "真的吗？"
            goro "That's great! That's the kind of enthusiasm we like to see."
            goro "No one on the team has ever used it yet. I'd love it if you could give a minor presentation on what you've learned!"
            player "I'd be glad to!"
            goro "Great. Keep this up, and you'll always be an asset to the team."
            "You gain 10 Renown for thinking ahead."
            $ player_stats.change_stats(RENOWN, 10)
    return

# start hackerspace stories
label v2_old_friend:
    player "This place is as busy as always!"
    player "I wonder if that “Moms Who Code” group finished their Hackathon project? I should go see!"
    greg "[player_name]? [player_name], is that you?"
    player "Oh my gosh, Greg! I haven't seen you since high school!"
    player "How have you been?"
    greg "I've been great, how about you? It's crazy to meet you here in HackerSpace!"
    greg "Are you a programmer too?"
    player "I am! I actually just landed my first software development job! I'm a junior developer at ConsultMe."
    greg "ConsultMe? Man, I love that place! I've heard awesome things about their company culture."
    player "Yeah, I still can't believe I landed the position sometimes! Where do you work?"
    greg "Um... well, I used to work at DevCo LLC, but I don't work there anymore. I'm currently looking for work."
    player "Oh jeez, I'm sorry to hear that!"
    greg "It's okay. Stuff happens, y'know?"
    greg "It's been ages since I've seen you though - let me grab us some coffee and we can sit down and catch up!"
    player "That super nice of you, thanks! I'll wait here for you."

    show layla with moveinleft
    layla "Did I just overhear that guy tell you that he's looking for work?"
    player "Yeah, that's Greg. We used to go to high school together."
    layla "Isn't ConsultMe hiring? You may want to think about referring him!"
    layla "You'll get more out of it than just helping a friend get a job."
    player "什么意思？"
    layla "Most companies have incentives to get existing employees to refer developers that they know to help them find new hires."
    layla "Hiring developers is expensive and time-consuming, so when you bring a good candidate to your company, usually you can get paid for it!"
    layla "I referred a developer that I knew from a gardening club that I'm in, and once they got hired, my company gave me about $3,000! Just for giving them my colleague's information!"
    player "Wow! That's a LOT of money for just passing information on. Do you think I should refer Greg?"
    layla "Maybe! You should talk to him about it. I've got to run and meet up with a client in one of the meeting rooms here, but I thought I'd drop by and say hello. "
    layla "祝好运！"
    hide layla with moveoutright

    scene bg hacker_space with blinds
    greg "Hey! Sorry for the wait. These developers love their coffee, so the line was super long!"
    player "Always! Lots of people in my office can't start their day without it."
    player "So, Greg..."

    menu:
        "Would you like me to refer you to a position at my company?":
            player "I've been thinking, and ConsultMe has another junior position open right now. Would you like me to refer you to it?"
            greg "What? No way, you'd do that for me [player_name]?"
            player "Of course, you're my old friend! I'd be glad to put in a good word with our team lead, Goro."
            greg "You'd be doing me a huge favor, thank you! The job market has been a little rough, so being able to get my foot in the door would be great!"
            player "Awesome! I'll send in my referral email first thing in the morning."

            $ calendar.next_weekday()
            scene bg company1_center with fadehold
            "Some time later..."
            show iris
            iris "So. Would you mind explaining yourself?"
            player "（这么早……Iris已经生我气了？）"
            player "Hi Iris. What am I explaining?"
            iris "We had an interview scheduled for your friend... Greg, was it?"
            player "Oh right, Greg! How did it go?"
            iris "Great. If you think showing up 15 minutes late to your first interview with a very loose tie and mis-matched socks is good, then great. Really great!"
            player "Oh jeez... did he at least interview well?"
            iris "I've never been called “dude” so many times in my life by one person."
            iris "When we asked him about noteworthy skills, he explained, in GREAT detail, how he ate 30 pieces of pizza on a dare once in college."
            iris @ disgust "He also likes drinking Ranch with his pizza."
            player "会拼啦。"
            player "等等。"
            player "You mean... PUTTING ranch ON his pizza, right?"
            iris "I know what I said."
            player "……"
            iris "The next time that you think about referring someone to the company... do spend a bit more time vetting them before sending in their resume, please."
            "You lost 15 renown for your shifty friend's behavior."
            $ player_stats.change_stats(RENOWN, -15)

        "If you don't mind me asking, why are you looking for a job?":
            player "If you don't mind me asking, why are you currently looking for a job?"
            greg "Weeeell, it's kind of a long story."
            player "I've got time! What's going on?"
            greg "Well, maybe it's not that long... you see, I got put on a PIP."
            player "Oh no - that stands for Personal Improvement Plan, right?"
            player "Don't you get those when you're not performing in some way at work?"
            greg "Sometimes, yes. In my case, I was performing pretty well - or at least, I think so."
            greg "My problem was that I was late to work. A lot. I missed a lot of meetings, and it was starting to affect my work."
            player "Wow - was your commute too long? I know sometimes in the mornings, my commute can take me an hour on a day with really bad traffic."
            greg "Not quite... I uh... worked from home."
            greg "嘿嘿……"
            player "（嗯……想想Greg高中时就挺懒散的。）"
            player "（上课睡觉作业迟交，被PIP不奇怪。）"
            player "So you got fired?"
            greg "Actually, I quit before I could get fired so it wouldn't reflect poorly on me when I interview with other places."
            greg "But for the time being, that still means that I don't have a position."
            greg "I know what you're thinking “That sounds like the same Greg I used to know”.  But things have been different!"
            player "(That's EXACTLY what I've been thinking...)"
            greg "I actually started going to the gym in the mornings lately, so I'm getting used to waking up at a set schedule so I don't repeat my mistake."
            player "That's good! Working out and getting my blood pumping always helps wake me up."
            player "Well Greg, it's getting a bit late - I should probably get home."
            player "Good luck with finding a new job! I hope that I can at least keep seeing you here at the HackerSpace?"
            greg "Definitely! It's a great place to network. You never know where your next gig will come from!"

            scene bg hacker_space_cafe with blinds
            show layla
            layla "So, are you going to recommend Greg?"
            player "No, I actually just have a bad feeling about it... Greg was always kind of a slacker in school. What happens if he hasn't changed?"
            layla "That's a good point. If he comes into an interview late and bombs it, or even gets hired but never comes in on time, that's a bad look for you."
            player "Right. I figured I'd better just play it safe."
    return

label v2_equity:
    player "I wonder what's going on in the HackerSpace today?"
    player "Hm... Oh look, there's Layla! And she's talking to someone, but she looks pretty upset."
    player "I wonder what's going on?"
    show layla
    layla "I'm telling you, you're wrong. If you're going to be a good developer, you've got to change your way of thinking."
    high_school_student "I feel like you're making a big deal out of nothing. I've never even seen this happen in real life."
    player "Sorry to butt in, but what's going on here?"
    layla "This young man asked for some help on his project for school."
    layla "We were looking over his code, and I noticed there wasn't a lot in his frontend's markup for accessibility."
    layla "He doesn't believe that that's necessary, and that he should just turn in his assignment as-is."
    high_school_student "I just don't understand what the point is? My site looks great."
    layla "The point is that even though we're able to see, there are blind and visually-impaired users that you'll have to take into account."
    high_school_student "What's there to change? I was just telling her that I've never seen a blind person using a phone or a computer. What would they use a phone for besides calling people?"
    high_school_student "How would they even use a phone to call people if it isn't a flip-phone? The buttons on a phone-screen aren't even solid!"
    layla "What do you think [player_name]? What should he do?"

    menu:
        "Accessibility is important.":
            player "Accessibility is important!"
            player "One of the students that I used to tutor in my last job had a smartphone, and it had some really cool accessibility features!"
            player "Computers and phones usually have screen-readers on them, which is special software that reads content on a screen out loud."
            high_school_student "Oh yeah? Well what happens when they get to a picture? Pictures aren't text, and my website has lots of pictures on it."
            layla "That's why it's important to use your aria-labels on visual elements like buttons, and alt-text on images."
            layla "When a screen-reader reaches an image, it usually reads out the word, “Image”, and whatever you've put into Alt-Text."
            high_school_student "Wow... so I guess in that way, visually impaired and blind people actually can use computers and phones?"
            player "Absolutely!"
            layla "I read that there is even software for visually impaired software developers to code just like those without visual impairments."
            layla "Just because it doesn't affect you doesn't mean it won't affect others."
            layla "I'm making such a “big deal” because it's good for you to get in the habit of doing these things now before you're working on big projects that others will be using in the future."
            high_school_student "Fine... maybe you're right. Can you remind me again which attributes I should be using so I can go in and make changes?"
            layla "I'd be happy to!"
            "You gained 10 renown. Good job working towards a more equitable world!"
            $ player_stats.change_stats(RENOWN, 10)

        "It's just for a school project Layla. Maybe it isn't that big of a deal?":
            player "I don't know Layla... this is just for a school project? Maybe it isn't that big of a deal?"
            layla "What? [player_name], don't you remember Lamont?"
            player "Lamont? ... Oh!"
            layla "There it is. So you DO remember Lamont."
            layla "You told me about him one day a few months ago. [player_name] here had a visually impaired student that she used to tutor."
            layla "He used a phone with a screen-reader, a special piece of software that read the content on his screen out loud."
            player "That's right... he was a really good student."
            layla "I'm sure he got the chance to be because the sites that you sent him to for study materials were screen-reader friendly."
            high_school_student "Oh yeah? Well what happens when they get to a picture? Pictures aren't text, and my website has lots of pictures on it."
            layla "That's why it's important to use your aria-labels on visual elements like buttons, and alt-text on images."
            layla "When a screen-reader reaches an image, it usually reads out the word, “Image”, and whatever you've put into Alt-Text."
            high_school_student "Wow... so I guess in that way, visually impaired and blind people actually can use computers and phones?"
            layla "[player_name], what would Lamont say to you if he heard what you said earlier?"
            player "Jeez... his feelings would probably be really hurt."
            layla "Exactly. "
            layla "Just because it doesn't affect the two of you doesn't mean it won't affect others."
            layla "I'm making such a “big deal” because it's good for everyone to get in the habit of doing these things now before you're working on big projects that others will be using in the future."
            high_school_student "Fine... maybe you're right. Can you remind me again which attributes I should be using so I can go in and make changes?"
            layla "I'd be happy to!"
            "Layla seems disappointed. You lose 10 Renown."
            $ player_stats.change_stats(RENOWN, -10)
    return

label v2_gelato:
    show layla at left
    show annika at right
    player smile "Hey Layla! Annika!"
    layla "Hey! Did you get the new Hackerspace newsletter?"
    player "No, I haven't checked it recently, why?"
    annika "There's a gelato place RIGHT next door now!"
    player "Wow, I love gelato!"
    layla "Wanna go grab some?"
    "You're just about to say yes when you hear a few voices behind you."
    "Two developers seem to be discussing a project at work."
    developer1 "So you said that you guys are using Flask?"
    developer2 "No, we're using Django on this project. We needed something bigger."
    developer1 "I've been wanting to ask forever - so what's the difference between Django and Flask?"
    developer2 "So flask is basically - "
    "You turn around again to Annika and Layla, the two of them now discussing their favorite gelato flavors."
    player "(Hmm... On one hand, I've had a long day at work today, and would love to take it easy with something cold and sweet.)"
    player "(On the other hand, our most recent meeting at work covered a client that we'll be taking over from another company.)"
    player "(They need maintenance on their larger app written in Django, and the creation of a smaller app written in Flask.)"
    player "（问问能不能旁听他们的对话应该能了解更多！）"
    player "(What should I do?)"

    menu:
        "Go get gelato with friends.":
            player "……"
            annika "Hey! Earth to [player_name]! Are you coming?"
            player "Oh! Absolutely!"
            player "My favorite flavor is Pistachio."
            layla "Pistachio??"
            annika "“噫——”"
            "You decide to have gelato with your friends. It's important to have downtime every now and then!"
            "If you really need to research about Flask or Django, you can do it during a bit of downtime at work tomorrow."
            "You gain 10 Energy for taking time with friends."
            $ player_stats.change_stats(ENERGY, 10)

        "Pardon myself and learn more about Flask/Django":
            player "Hey guys? Have either of you ever worked with Flask or Django?"
            layla "Hm... I've used Flask a bit before, but I've never used Django."
            annika "My job uses Django, and I'm learning, but I've never heard of Flask."
            player "Well, those two over there are talking about it! One of them just started explaining the difference between the two."
            player "Want to join their conversation?"
            annika "Sounds like a blast!"
            layla "Let's go - maybe we can invite them to grab gelato with us when we're done!"
            "The three of you approach the two developers and bring up their earlier conversation."
            "The first developer offers you all an in-depth explanation of the two frameworks."
            "You feel much more prepared to follow the conversation at work tomorrow!"
            "Your conversation leads into other topics, and you all don't quite have enough time for gelato,"
            "but you've learned a lot!"
            "You gain 10 Renown points."
            $ player_stats.change_stats(RENOWN, 10)
    return

label v2_internet_safety:
    show layla
    layla "嘿你好！"
    player "Hi Layla! Wanna take a look at the community board and see if any good talks are coming up?"
    layla "That sounds like a good time! I missed the React talk last month, so I've been trying to check more often."
    player "Cool! I've been meaning to pick up Angular, so I hope they have a seminar on that ne-..."
    player "……"
    layla "[player_name]? Everything okay?"
    player "I'm just remembering..."
    player "I forgot to get a React ticket submitted today!"
    layla "Oh no! Was it urgent?"
    player "It kind of is. I finished pretty much all of it, but I forgot to commit my code!"
    layla "Well that can't be too hard, right? I don't mind waiting for you while you get that finished up."
    player "Really? Okay!"
    player "All I need now is a wifi connection."
    layla "Oh, I have the wifi password! It's pebcak2022."
    player "Pebcak? Someone at work said that word last week. I still don't know what it means."
    layla "Hehehe..."
    player "Well, I guess I'll get connected and end this so we can get back to what we were doing."

    menu:
        "Connect to the Hackerspace wifi and commit.":
            player "Done! Now we can get back to the community board before all of the pamphlets have been taken - "
            layla "Wait, hold on,"
            layla "when you committed just now, were you connected to a VPN?"
            player "A VPN?"
            layla "Yeah - they're pieces of software that can protect private information on your computer when you're connected to wifi, and hide you from others on the same network."
            player "Why would I want that?"
            layla "Getting on wifi in public spaces can be risky. It's one thing to do it on your personal computer - "
            layla "though you really shouldn't do that either -"
            layla "but it's another thing entirely when it's a work laptop. You could have important private information stolen from your computer."
            player "……"
            layla "It might be okay!"
            layla "Just having been on a public network doesn't mean you definitely got information stolen. But it definitely does open you up to the risk."
            player "How do I even get a VPN?"
            layla "Usually your company has one that they like to use."
            layla "There are lots of ones that you can pay for yourself, but you should probably go with one your job already has a membership with."
            player "Aw man... I really, really hope nothing happens..."
            layla "(sigh) Best not to let it worry you too much now. Your code has already been committed."
            player "Yeah. I guess you're right."
            "You lose 10 Energy, worried about your private information."
            $ player_stats.change_stats(ENERGY, -10)

        "Wait until work tomorrow to commit.":
            player "I dunno... I don't want to stress too much. Maybe I can just commit tomorrow?"
            layla "If you say so! What VPN does your company use?"
            player "VPN"
            layla "Yeah - they're pieces of software that can protect private information on your computer, and hide you from others on the same network."
            player "Why would I want that?"
            layla "Getting on wifi in public spaces can be risky. It's one thing to do it on your personal computer - "
            layla "though you really shouldn't do that either -"
            layla "but it's another thing entirely when it's a work laptop. You could have important private information stolen from your computer."
            player "Oh jeez! So it sounds like I really should wait until tomorrow anyway! I don't have one."
            player "How do I even get a VPN?"
            layla "Usually your company has one that they like to use."
            layla "There are lots of ones that you can pay for yourself, but you should probably go with one your job already has a membership with."
            player "Gotcha! I'll make sure that I message our IT team first thing in the morning and put in a request for one."
    return

label v2_where_to_start:
    "It's as busy as ever at the Hackerspace."
    "You scan around the room looking for a familiar face and spot Layla and Annika sitting at a table by the vending machine."
    show layla at left
    show annika at right
    "As you slide into a seat and greet your friends, a young man approaches, no older than 18."
    teen "你好。"
    annika "Hey, what's up? Are you new here?"
    teen "Kind of... I've been coming for a few weeks now after school. I've been mostly scoping the place out."
    layla "That makes sense - it can be a little nerve-wracking in a busy place like this! But everyone's mostly really nice."
    teen "Right - that's why I came to talk to the three of you!"
    teen "Almost every day I come here, I see one of or all of you sitting and talking with newbies or other developers."
    teen "I've started to teach myself to code a few months ago. I'm really close to graduating high school, and I like coding a lot!"
    player "That's awesome! I taught myself how to code too - it's a lot of hard work, but it's definitely worth it!"
    teen "It's definitely been difficult, but I can't seem to put my laptop down once I've really gotten into a bug!"
    layla "Haha, if getting caught on a bug EXCITES or CHALLENGES you more than it makes you want to quit, you're definitely going into the right field!"
    teen "Well, that's what I came over to ask about - "
    teen "I've been reading a lot of articles online to learn what I need to do to start looking for a real job in the field, since I graduate in about six months."
    teen "All of them say that you need a portfolio. I just don't really know what I should be putting into one."
    annika "[player_name], you're the one who's gotten into the field most recently out of the three of us."
    annika "Maybe you should answer this one! Since it's so fresh?"
    player "Er, sure! So you just need an idea of the types of projects you should be making?"
    teen "就这么简单！"
    player "And what type of programming job would you like?"
    teen "I've researched a lot, and I want to go into web development!"
    player "Hm... Well, if you're preparing projects for a portfolio, you should make sure your projects..."

    menu:
        "...are as visually appealing as possible":
            player "... because if your projects don't look great, potential employers won't take you seriously!"
            teen "Wow, really?"
            teen "I had no clue!"
            player "Yep! So make sure you spend as much time on your frontends as possible."
            teen "Got it! I'm going to grab some coffee, find a comfortable spot, and get started on my portfolio!"
            "Annika and Layla share a look. They both look concerned."
            "Layla quickly whispers something to Annika, and they both nod."
            layla "... hey, you said you're going to grab some coffee?"
            layla "I could use a cup too. Why don't I come with you?"
            teen "好呀~"
            "The two of them walk off, the budding developer excitedly talking about his latest project."
            annika "Hey [player_name], did you really mean what you said a few minutes ago?"
            player "Sure! I mean, I wish I spent more time on the frontend of my projects, so I thought I'd tell him to do the same."
            annika "明白了……"
            annika "I just ask, because I definitely wouldn't say that that was the most important thing that he should have been focusing on."
            player "Oh no! What should I have said instead?"
            annika "I mean, think about it:"
            annika "The point of having a portfolio as a developer with no experience is to show a potential employer that you know how to do what they need you to do on the job."
            annika "So a project in a portfolio should show off all of the basic skills of a junior developer."
            player "What do you have in mind?"
            annika "Well, during my interview process, I was asked to describe MVC, and how it worked."
            annika "I was also asked to explain how HTTP requests work."
            annika "So, I would use projects that have a good frontend and a backend that either I made, or an API that I've called."
            annika "That way, they'd know that I know how to make HTTP requests or APIs."
            annika "Having a really attractive frontend doesn't necessarily say anything about your skill as a programmer."
            annika "It'd probably help if you were going for a UX/UI position, it'd be completely fine..."
            player "... but he said he wanted to be a developer."
            player "Sheesh! That's so embarrassing!"
            annika "It's okay! We're only juniors."
            annika "It's just best for new devs to focus on showing off their skills and the functionality of their app rather than how they look,"
            annika "or using a million technologies, or things like that."
            player "So I just told that guy something wrong... What if he follows my advice?"
            annika "Don't worry - Layla's having a chat with him to set him straight."
            annika "So it's okay!"
            "You lose 10 Energy out of embarrassment."
            $ player_stats.change_stats(ENERGY, -10)

        "...have a few cool features, and use at least one API":
            player "... because it's all about showing potential employers what you can do."
            teen "Really? What do you mean by that?"
            player "When I was looking for my first position, I had to work on a portfolio too,"
            player "and I wanted a million features, and I wanted to use a million different technologies, and spend hours making the app look just right..."
            player "But then one of my mentors that I met in freeCodeCamp's forums told me that the most important thing is to create projects that acted as PROOF that my skills matched the job description."
            annika "That's right!"
            annika "I've gotten to sit in on a few interviews at my job, and we look to portfolios the most when an applicant doesn't have any other work experience."
            annika "So because you want to become a web developer, you should build a project that shows that you have web development fundamentals down."
            layla "Yep! That's why [player_name] mentioned using at least one API. A web developer should know how to call on API's (and how to build them for good measure)."
            layla "As far as having a few cool features goes, when I interview applicants at the nonprofit, we'll often get applicants in our junior positions with lots of projects."
            layla "But the funny thing is: They're rarely ever finished!"
            teen "真的吗？"
            teen "Hm... So it's not good to go into an interview with an unfinished project?"
            layla "No, no, that's definitely fine! It shows that you still have things that you're working on so that you can improve your skills."
            layla "I'd just recommend two complete, fleshed-out projects with cool features to 10 unfinished projects."
            layla "Simply FINISHING a project or two will put you ahead of other applicants..."
            teen "Gotcha! Okay, so I just need to make sure that my projects are finished! That shouldn't be too hard."
            teen "But... how do I come up with ideas for good projects?"
            layla "Good question! Do you have any advice for them, [player_name]?"
            player "Well, some of the best advice I've ever heard is that it's best to make a project that does something that you hate doing."
            player "You come up with a solution to a real problem - a real problem that you're intimately familiar with!"
            teen "Yeah... yeah! And I'll definitely finish if I'm solving my own problem."
            teen "Thanks [player_name]! Can I come back if I have more questions?"
            player "Of course!"
            "It feels great to help new developers get where they want to be even faster than you were able to!"
            "You gain 5 Renown for paying it forward."
            $ player_stats.change_stats(RENOWN, 5)

        "...have as many features and technologies as possible":
            player "... because if you know lots of technologies, the chance of you getting a job is much higher!"
            player "Plus, having a ton of features will really show off your versatility."
            teen "Wow, really?"
            teen "I had no clue!"
            player "Yep! So make sure you really get to studying so you can be a jack of all trades!"
            teen "Got it! I'm going to grab some coffee, find a comfortable spot, and get started on my portfolio!"
            "Annika and Layla share a look. They both look concerned."
            "Layla quickly whispers something to Annika, and they both nod."
            layla "... hey, you said you're going to grab some coffee?"
            layla "I could use a cup too. Why don't I come with you?"
            teen "好呀~"
            "The two of them walk off, the budding developer excitedly talking about his latest project."
            annika "Hey [player_name], did you really mean what you said a few minutes ago?"
            player "Sure! I mean, I feel like I got really lucky landing this job, since I only know about 4 or 5 technologies."
            player "I bet I could have gotten even more interviews if I knew 9 or 10!"
            annika "明白了……"
            annika "I just ask, because I definitely wouldn't say that that was the most important thing that he should have been focusing on."
            player "Oh no! What should I have said instead?"
            annika "I mean, think about it:"
            annika "The point of having a portfolio as a developer with no experience is to show a potential employer that you know how to do what they need you to do on the job."
            annika "So a project in a portfolio should show off all of the basic skills of a junior developer."
            player "What do you have in mind?"
            annika "Well, during my interview process, I was asked to describe MVC, and how it worked."
            annika "I was also asked to explain how HTTP requests work."
            annika "So, I would use projects that have a good frontend and a backend that either I made, or an API that I've called."
            annika "That way, they'd know that I know how to make HTTP requests or API's."
            annika "Knowing how to use a dozen technologies doesn't mean that you're going to be a good developer."
            annika "I got hired for this position, and I didn't even know most of the technologies that they asked for."
            annika "Once you know one programming language, you can kind of pick up any of them more easily."
            annika "As far as adding a million features,"
            annika "I wanted to do the same thing while I was building my portfolio."
            annika "But one of my mentors said that 4 or 5 good features per project would be more than enough."
            annika "He actually told me that I should just focus on making TWO good projects."
            annika "It was kind of funny, but he said that it's rare for juniors to even FINISH projects."
            annika "He told me that even having two polished, finished projects would impress a panel of interviewers."
            annika "Otherwise, how are you going to PROVE you know the many technologies you say that you do?"
            player "Sheesh! That's so embarrassing!"
            annika "It's okay! We're only juniors. "
            annika "It's just best for new devs to focus on showing off their skills and the functionality of their app rather than how they look,"
            annika "or using a million technologies, or things like that."
            player "So I just told that guy something wrong... What if he follows my advice?"
            annika "Don't worry - Layla's having a chat with him to set him straight. "
            annika "So it's okay!"
            "You lose 10 Energy out of embarrassment."
            $ player_stats.change_stats(ENERGY, -10)
    return
