screen save_reminder_screen(message, yes_action, no_action):
    # based on the confirm screen
    modal True

    zorder 200

    style_prefix "confirm"

    add "gui/overlay/confirm.png"

    frame:

        vbox:
            xalign .5
            yalign .5
            spacing 45

            label _("你想在以后收到保存进度的提醒吗？"):
                style "confirm_prompt"
                xalign 0.5

            hbox:
                xalign 0.5
                spacing 150

                style_prefix "radio"
                textbutton _("Keep reminding me to save"):
                    action ToggleField(persistent, 'enable_save_reminder')
                    xsize 250
                textbutton _("Turn off future reminders"):
                    action InvertSelected(ToggleField(persistent, 'enable_save_reminder'))
                    xsize 250

            label _(message):
                style "confirm_prompt"
                xalign 0.5

            hbox:
                xalign 0.5
                spacing 150

                textbutton _("是") action yes_action
                textbutton _("否") action no_action

    ## Right-click and escape answer "no".
    key "game_menu" action no_action

label save_reminder:
    if persistent.enable_save_reminder == False: # not None
        return # return control to whatever label that called this

    elif persistent.enable_save_reminder: # is True
        "（友好的{b}保存提醒{/b}向你问好！）"
        
    # first time player will have persistent.enable_save_reminder is None
    elif persistent.enable_save_reminder is None:
        # set to True so the toggle on the screen is True by default
        $ persistent.enable_save_reminder = True        

    "（要{b}保存{/b}当前进度吗？）"

    call screen save_reminder_screen(_("Would you like to save your progress up to now?"), 
        yes_action=[ShowMenu('save'), Return()], 
        no_action=Return())

    "感谢关注{b}保存提醒{/b}！继续故事……"
    return
