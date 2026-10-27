// Each native selector is mapped by function. Unmapped icons retain their shape.
export const iconRules=[
 ['.cw-web-new','newchat','svg'],['.cw-web-more','more','svg'],['.cw-web-search','search','svg'],
 ['.clawd-mobile-new-chat','newchat'],
 ['.cw-v4-chat-more','p3','svg'],['.cw-b34-paper-button','scroll','svg'],
 ['.clawd-rail-toggle','sidetoggle'],['.clawd-mobile-menu-button','hamburger'],
 ['#leftNavDrawerIcon','potion','self'],['#API-status-top','batplug','self'],
 ['#advanced-formatting-button .drawer-icon','hatA','self'],['#WIDrawerIcon','crystal','self'],
 ['#user-settings-button .drawer-icon','mirror','self'],['#backgrounds-button .drawer-icon','moonpic','self'],
 ['#extensions-settings-button .drawer-icon','candy','self'],['#rightNavDrawerIcon','ghost','self'],
 ['#persona-management-button .drawer-icon','witchuser','self'],
 ['.cw-v4-navitem[data-panel="left-nav-panel"] .cw-v4-icon','potion','self'],
 ['.cw-v4-navitem[data-panel="WorldInfo"] .cw-v4-icon','spellbook','self'],
 ['.cw-v4-navitem[data-panel="right-nav-panel"] .cw-v4-icon','gcard','self'],
 ['.cw-v4-navitem[data-pref="char"] .cw-v4-icon','maskcard','self'],
 ['.cw-v4-navitem[data-pref="acct"] .cw-v4-icon','pumpkinhead','self'],
 ['#options_button','clist'],['#extensionsMenuButton','wand'],['body.cw-v4-filled:not(.claude-generation-active) #send_but','send'],
 ['body:not(.cw-v4-filled):not(.claude-generation-active) #send_but','candles'],
 ['#microphone_button','gmic'],
 ['.clawd-fake-mic','gmic'],
 ['.mes_copy:not([data-cw-copy]):not([data-cw-halloween-copy])','tombs'],
 ['.mes_edit','quill'],['.mes_narrate','candycorn'],['.mes_edit_delete','cauldron'],
 ['.claude-user-message-edit','quill'],['.claude-user-message-delete','cauldron'],
 ['.mes_buttons .mes_button.fa-ellipsis-h','p3'],['.clawd-reroll-button','reroll'],
 ['#option_regenerate','reroll'],['#option_continue','broom'],['#option_impersonate','ghost'],
 ['#option_delete_mes','cauldron'],['#option_new_bookmark','batflag'],['#option_convert_to_group','ghosts'],
 ['#option_close_chat','bones'],['#option_close_chat .fa-solid','bones'],['#option_select_chat','coffin'],
 ['#option_select_chat .fa-solid','coffin'],['#option_continue .fa-solid','broom'],
 ['#option_start_new_chat .fa-solid','gbubble'],['#option_delete_mes .fa-solid','cauldron'],
 ['#ui-preset-update-button','floppyMoon'],['#ui-preset-save-button','floppyStar'],
 ['#ui_preset_import_button','pailIn'],['#ui_preset_export_button','pailOut'],['#ui-preset-delete-button','cauldron'],
];
export const halloweenCSS=String.raw`
html[data-cw-halloween="on"] .hw-anchor{pointer-events:none;position:absolute;display:block;line-height:1;user-select:none}
html[data-cw-halloween="on"] .clawd-welcome-hero{position:relative}
.hw-welcome{left:50%;bottom:calc(100% + 10px);width:min(310px,70vw);height:75px;transform:translateX(-50%);color:#d97757;opacity:.62;transition:opacity .2s,transform .2s}
.hw-welcome svg{width:100%;height:100%;overflow:visible}.hw-hanging-star{position:absolute;left:calc(76% - 7px);top:57px;font-size:19px;color:#d97757}
html.hw-typing .hw-welcome{opacity:0;transform:translate(-50%,-15px)}
.hw-web{top:0;left:0;width:76px;height:62px;color:#d97757;opacity:.45;overflow:hidden}.hw-web svg{width:100%;height:100%}
.hw-footer{left:10px;top:calc(100% + 8px);font-size:11px;color:var(--cl-muted,#7b7974);white-space:nowrap}
html[data-cw-halloween="on"] button.hw-pail{all:unset;box-sizing:border-box!important;position:fixed!important;display:block!important;width:21px!important;height:24px!important;margin:0!important;padding:0!important;border:0!important;bottom:auto!important;pointer-events:auto!important;cursor:pointer!important;z-index:2999!important;touch-action:manipulation!important}
html[data-cw-halloween="on"] button.hw-pail:focus-visible{outline:2px solid var(--cl-accent,#d97757)!important;outline-offset:3px!important}
html[data-cw-halloween="on"] button.hw-pail:disabled{cursor:default!important}
.hw-pixels{display:block!important;max-width:none!important;image-rendering:pixelated;pointer-events:none;object-fit:fill}
html[data-cw-halloween="on"] .clawd-mobile-new-chat::before{display:inline-block!important;width:18px!important;height:18px!important;flex:none!important}
.hw-fx{position:fixed!important;z-index:2999;pointer-events:none;user-select:none;contain:layout style}
.hw-corner-ghost{position:absolute;right:18px;top:-18px;width:30px;height:23px;overflow:hidden;pointer-events:none;opacity:.8;z-index:1}.hw-corner-ghost img{width:28px!important;height:auto!important}
.hw-spider-body{display:block!important;width:22px!important;height:20px!important;left:-11px!important;background:currentColor;mask:var(--cw-hw-spider) center/contain no-repeat;-webkit-mask:var(--cw-hw-spider) center/contain no-repeat}
.hw-roaming{display:block!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;padding:0!important;min-width:0!important;min-height:0!important;width:44px!important;height:48px!important;overflow:hidden;pointer-events:auto;cursor:pointer;touch-action:manipulation;outline-offset:3px}
.hw-roaming:focus-visible{outline:2px solid #d97757!important}.hw-roaming>img{width:40px!important;height:auto!important}
.hw-boo-body{display:block;position:absolute;inset:0;width:44px;height:48px;transform-origin:50% 90%}.hw-boo-body img{position:absolute;inset:0;width:40px!important;height:auto!important}
.hw-boo-head{position:absolute;left:6px;top:12px;width:28px;height:24px;background:#d97757;opacity:0}.hw-boo-head:before,.hw-boo-head:after{content:'';position:absolute;top:7px;width:3px;height:5px;background:#2b1d17}.hw-boo-head:before{left:6px}.hw-boo-head:after{right:6px}
.hw-boo-hand{position:absolute;top:25px;width:7px;height:7px;background:#fbf8f1;border:1px solid #cdc6ba}.hw-boo-left{left:0}.hw-boo-right{right:2px}.hw-boo-label{position:absolute;right:40px;top:2px;color:var(--cl-ink,#222);font:600 14px Georgia,serif}
.hw-send{display:flex;align-items:flex-end;width:60px;height:58px;gap:8px}.hw-send>img{position:absolute;left:0;bottom:0}.hw-send-text{position:absolute;left:57px;bottom:7px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:13px;line-height:20px;color:var(--cl-ink,#222);background:var(--cl-surface,#fff);border-radius:4px;padding:3px 5px}
.hw-broom{position:absolute;left:26px;bottom:0;width:34px;height:50px}.hw-shaft{position:absolute;left:12px;top:0;width:3px;height:41px;background:#8b5e3c}.hw-grip{position:absolute;width:8px;height:6px;background:#d97757;box-shadow:inset 0 1px #e78a69;z-index:2}.hw-grip-l{left:5px;top:11px}.hw-grip-r{left:12px;top:14px}.hw-bristles{position:absolute;left:0;bottom:0;width:28px;height:17px;background:repeating-linear-gradient(75deg,#cfa261 0 3px,#8b5e3c 3px 4px);clip-path:polygon(35% 0,65% 0,100% 100%,0 100%)}
.hw-delete-page{position:absolute;top:25px;left:12px;display:block;width:32px;height:25px;overflow:hidden;border:1px solid var(--cl-line-strong,#aaa);border-radius:2px;background:var(--cl-surface,#fff);color:var(--cl-muted,#777);font:4px/1.8 sans-serif;padding:2px}.hw-delete-pot{width:48px;height:48px;color:var(--cl-muted,#777)}.hw-delete-pot svg{width:100%;height:100%}
.hw-spider{width:0;height:0;color:#d97757}.hw-spider-thread{position:absolute;left:0;top:0;width:1px;height:55px;background:#d9775799}.hw-spider-body{position:absolute;left:-12px;top:50px;font:15px/20px monospace;color:var(--cl-ink,#222);white-space:nowrap}.hw-puppet{position:absolute;left:-30px;bottom:-7px;clip-path:inset(0 0 8px 0)}.hw-puppet-eyes{position:absolute;left:-21px;bottom:11px;width:22px;height:6px;background:#d97757}.hw-puppet-eyes:before,.hw-puppet-eyes:after{content:'';position:absolute;top:4px;width:2px;height:3px;background:#2b1d17}.hw-puppet-eyes:before{left:2px}.hw-puppet-eyes:after{right:2px}.hw-puppet-paw{position:absolute;left:-25px;top:0;width:6px;height:6px;background:#d97757}.hw-puppet-paw-r{left:-3px}
.hw-sr{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip-path:inset(50%)!important}
html[data-cw-halloween="on"] .mes_copy[data-cw-halloween-copy="success"]::before{visibility:hidden!important}
html[data-cw-halloween="on"] .mes_copy[data-cw-halloween-copy="success"]::after{content:""!important;position:absolute!important;inset:0!important;background:currentColor!important;mask:var(--cw-hw-skull) center/14px 14px no-repeat!important;-webkit-mask:var(--cw-hw-skull) center/14px 14px no-repeat!important}
html[data-cw-halloween="on"] .cw-v4-shell .cw-v4-row input[type="checkbox"]{accent-color:#d97757}
html[data-cw-halloween="on"] .cw-v4-switch{border-radius:46% 46% 42% 42%!important}
html[data-cw-halloween="on"] .cw-v4-nav button[aria-current="page"]{border-inline-start:2px solid #d97757}
html[data-cw-halloween="on"] .cw-v4-danger::after{content:'';display:inline-block;width:4px;height:7px;background:#b75c52;border-radius:60% 40% 55% 55%;transform:rotate(18deg);margin-left:4px;pointer-events:none}
html[data-cw-halloween="on"].hw-typing .clawd-welcome-hero>.asterisk{transform:translateY(-58px)!important;transition:transform .2s}
html[data-cw-halloween="on"] .hw-footer{display:block!important;height:auto!important;width:auto!important;background:transparent!important;font:11px/1.4 var(--mainFontFamily,sans-serif)!important;text-align:left!important;opacity:.7}
html[data-cw-halloween="on"] :is(.cw-v4-panel,.cw-v4-editor) select:not([multiple]){background-image:var(--cw-hw-select)!important}
html[data-cw-halloween="on"] .cw-v4-segsel-item[aria-pressed="true"]{clip-path:polygon(0 0,100% 0,100% 91%,92% 100%,84% 91%,76% 100%,68% 91%,60% 100%,52% 91%,44% 100%,36% 91%,28% 100%,20% 91%,12% 100%,4% 91%,0 95%)}
html[data-cw-halloween="on"] :is(.cw-v4-panel,.cw-v4-editor) input[type=checkbox]:checked:not(.sr-only):not([data-v-app] *)::after{border-radius:0!important;background:var(--cw-hw-pumpkin) center/contain no-repeat!important;box-shadow:none!important}
html[data-cw-halloween="on"] .clawd-mobile-menu-button>span{visibility:hidden!important}
html[data-cw-halloween="on"] .clawd-mobile-menu-button::before{content:''!important;position:absolute!important;left:0!important;top:0!important;display:block!important;width:100%!important;height:100%!important;mask-size:22px 22px!important;-webkit-mask-size:22px 22px!important}
html[data-cw-halloween="on"][data-claude-motion="off"] .clawd-welcome-hero>.asterisk{transition:none!important}
@media(prefers-reduced-motion:reduce){.hw-welcome{transition:none}html[data-cw-halloween="on"] .clawd-welcome-hero>.asterisk{transition:none!important}}
@media(max-width:700px){.hw-welcome{height:58px;bottom:calc(100% + 8px)}.hw-hanging-star{top:44px}.hw-footer{font-size:10px;top:calc(100% + 5px)}}
`;
