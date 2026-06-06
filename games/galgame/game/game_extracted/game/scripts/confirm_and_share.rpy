# https://www.renpy.org/doc/html/screen_special.html
# based on the confirm screen

define alternative_endind_message = _("恭喜！你刚发现了一个替代结局。")

screen confirm_and_share_screen(title, message=None, ok_text=None, tweet_content_url=tweet_default, show_achievements_count=True):

    # using `game menu root` will make this screen replace background image
    # modal True
    # window:
    #     style "gm_root"
    frame:
        style_prefix "confirm"

        xfill True
        xsize 1000
        # xmargin 50 # don't use this, otherwise {sc} tag overflows
        ypadding 30
        yalign .25

        vbox:
            xfill True
            spacing 25

            text _(title):
                xalign 0.5
                text_align 0.5
                color gui.accent_color
                size gui.label_text_size
                font gui.interface_text_font

            if message is None:
                $ message = _("这成就解锁了！")
            text _(message):
                xalign 0.5
                text_align 0.5

            if show_achievements_count:
                $ num_achievements = len(persistent.achievements)
                text _("已解锁成就数：[num_achievements] / [total_num_achievements]"):
                    xalign 0.5

            textbutton _("{icon=icon-twitter} Tweet this"):
                xalign 0.5
                action OpenURL(tweet_content_url)

            if ok_text is None:
                $ ok_text = _("全部解锁！")
            textbutton ok_text:
                xalign 0.5
                action [
                Notify(_("此成就保存到奖励菜单，没发过的话随时发推！")),
                Return()
                ]