// Approved v31 icon selectors; unmapped controls retain native icons.
export const iconRules=[
 [
  ".cw-web-new",
  "newchat",
  "svg"
 ],
 [
  ".clawd-mobile-new-chat",
  "newchat"
 ],
 [
  ".cw-desk-seg>.cw-on>svg",
  "chattab",
  "svg"
 ],
 [
  ".cw-b34-paper-button",
  "paper",
  "svg"
 ],
 [
  "#leftNavDrawerIcon",
  "potion",
  "self"
 ],
 [
  ".cw-v4-navitem[data-panel=\"left-nav-panel\"] .cw-v4-icon",
  "potion",
  "self"
 ],
 [
  "#API-status-top",
  "plug",
  "self"
 ],
 [
  "#WIDrawerIcon",
  "crystal",
  "self"
 ],
 [
  ".cw-v4-navitem[data-panel=\"WorldInfo\"] .cw-v4-icon",
  "spellbook",
  "self"
 ],
 [
  "#rightNavDrawerIcon",
  "ghost",
  "self"
 ],
 [
  "#option_impersonate>i",
  "ghost",
  "native"
 ],
 [
  ".cw-v4-navitem[data-panel=\"right-nav-panel\"] .cw-v4-icon",
  "gcard",
  "self"
 ],
 [
  "#advanced-formatting-button .drawer-icon",
  "hatA",
  "self"
 ],
 [
  "#user-settings-button .drawer-icon",
  "mirror",
  "self"
 ],
 [
  "#backgrounds-button .drawer-icon",
  "moonpic",
  "self"
 ],
 [
  "#extensions-settings-button .drawer-icon",
  "candy",
  "self"
 ],
 [
  ".cw-v4-navitem[data-pref=\"acct\"] .cw-v4-icon",
  "jack",
  "self"
 ],
 [
  "#extensionsMenuButton",
  "wand"
 ],
 [
  "body:not(.cw-v4-filled):not(.claude-generation-active) #send_but",
  "candles"
 ],
 [
  ".mes_copy:not([data-cw-copy]):not([data-cw-halloween-copy])",
  "tombs"
 ],
 [
  ".mes_edit_delete",
  "cauldron"
 ],
 [
  ".claude-user-message-delete",
  "cauldron"
 ],
 [
  "#option_delete_mes>i",
  "cauldron",
  "native"
 ],
 [
  "#ui-preset-delete-button",
  "cauldron"
 ],
 [
  "#option_continue>i",
  "cont",
  "native"
 ],
 [
  "#option_new_bookmark>i",
  "flag",
  "native"
 ],
 [
  "#option_convert_to_group>i",
  "ghosts",
  "native"
 ],
 [
  "#option_start_new_chat .fa-solid",
  "bubble"
 ],
 [
  "#option_close_chat>i",
  "bones",
  "native"
 ],
 [
  "#ui_preset_import_button",
  "pailIn"
 ],
 [
  "#ui_preset_export_button",
  "pailOut"
 ],
 [
  ".cw-v4-navitem[data-pref=\"chat\"] .cw-v4-icon",
  "bubble",
  "self"
 ]
];
export const halloweenCSS=String.raw`
@keyframes hw-sheet-float{0%,100%{translate:0 -1px}25%{translate:0 -3px}75%{translate:0 1px}}
html[data-cw-halloween="on"] .clawd-pile-c[data-name="cowboy"] .clawd-pile-leg{display:none!important}
html[data-cw-halloween="on"] .clawd-pile-c[data-name="cowboy"] .clawd-pile-s{animation:hw-sheet-float 2.5s ease-in-out infinite}
html[data-cw-halloween="on"] .clawd-pile-shadow:has(+.clawd-pile-c[data-name="cowboy"]){opacity:.45}
.hw-prank-cursor{position:relative}
.hw-prank-cursor>.hw-pixels{animation:hw-sheet-float 2.5s ease-in-out infinite}
.hw-prank-cursor::after{content:"";position:absolute;left:50%;bottom:-4px;width:13px;height:2px;translate:-50% 0;border-radius:50%;background:rgba(0,0,0,.2)}
html[data-cw-halloween="on"][data-cw-hw-calm="on"] :is(.clawd-pile-c[data-name="cowboy"] .clawd-pile-s,.hw-prank-cursor>.hw-pixels),html[data-cw-halloween="on"][data-cw-hw-ambient="off"] :is(.clawd-pile-c[data-name="cowboy"] .clawd-pile-s,.hw-prank-cursor>.hw-pixels){animation:none;translate:0 0}
@media(prefers-reduced-motion:reduce){html[data-cw-halloween="on"] .clawd-pile-c[data-name="cowboy"] .clawd-pile-s,.hw-prank-cursor>.hw-pixels{animation:none;translate:0 0}}
@keyframes hw-web-sway{0%,100%{transform:rotate(0deg)}25%{transform:rotate(1.15deg)}75%{transform:rotate(-1.15deg)}}
.hw-live-web,.hw-live-web *,.hw-chat-deco,.hw-chat-deco *{pointer-events:none!important;user-select:none}.hw-web-thread{transform-origin:top;transition:height .2s}.hw-web-star{transition:top .2s}.hw-chat-deco{position:fixed!important}
.hw-fx.hw-node-spider,.hw-fx.hw-node-ripple{z-index:3003}
.hw-node-spider,.hw-node-thread,.hw-node-body,.hw-node-ripple,.hw-prank,.hw-prank *{pointer-events:none!important;user-select:none}
.hw-flight-char,.hw-flight-spark,.hw-delete-spark,.hw-delete-asterisk,.hw-delete-puff,.hw-delete-moth{display:block;pointer-events:none;user-select:none;transform-origin:center}
.hw-flight-layer{position:fixed;inset:0;pointer-events:none}.hw-deletion-layer{pointer-events:none;isolation:isolate}.hw-delete-puff{border-radius:50%}.hw-delete-moth svg{overflow:visible}
html[data-cw-halloween="on"] #send_form>.clawd-composer-clawd>.clawd-rig{translate:0 var(--cw-hw-rig-lift,0px)}
html[data-cw-halloween="on"] .hw-anchor{pointer-events:none;position:absolute;display:block;line-height:1;user-select:none}
html[data-cw-halloween="on"] .clawd-welcome-hero{position:relative}
.hw-welcome{left:50%;bottom:calc(100% + 10px);width:min(310px,70vw);height:75px;transform:translateX(-50%);color:#d97757;opacity:.62;transition:opacity .2s,transform .2s}
.hw-welcome svg{width:100%;height:100%;overflow:visible}.hw-hanging-star{position:absolute;left:calc(76% - 7px);top:57px;font-size:19px;color:#d97757}
html.hw-typing .hw-welcome{opacity:0;transform:translate(-50%,-15px)}
.hw-web{top:0;left:0;width:76px;height:62px;color:#d97757;opacity:.45;overflow:hidden}.hw-web svg{width:100%;height:100%}
.hw-footer{left:10px;top:calc(100% + 8px);font-size:11px;color:var(--cl-muted,#7b7974);white-space:nowrap}
html[data-cw-halloween="on"] button.hw-pail{all:unset;box-sizing:border-box!important;position:fixed!important;display:block!important;width:21px!important;height:24px!important;margin:0!important;padding:0!important;border:0!important;bottom:auto!important;pointer-events:auto!important;cursor:pointer!important;z-index:2999!important;touch-action:none!important}
html[data-cw-halloween="on"] button.hw-pail:focus-visible{outline:2px solid var(--cl-accent,#d97757)!important;outline-offset:3px!important}
html[data-cw-halloween="on"] button.hw-pail:disabled{cursor:default!important}
.hw-pixels{display:block!important;max-width:none!important;image-rendering:pixelated;pointer-events:none;object-fit:fill}
html[data-cw-halloween="on"] .clawd-mobile-new-chat::before{display:inline-block!important;width:18px!important;height:18px!important;flex:none!important}
.hw-fx{position:fixed!important;z-index:2999;pointer-events:none;user-select:none;contain:layout style}
.hw-corner-ghost{position:absolute;right:18px;top:-18px;width:30px;height:23px;overflow:hidden;pointer-events:none;opacity:.8;z-index:1}.hw-corner-ghost img{width:28px!important;height:auto!important}
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
html[data-cw-halloween="on"][data-claude-motion="off"] .clawd-welcome-hero>.asterisk{transition:none!important}
@media(prefers-reduced-motion:reduce){.hw-welcome{transition:none}html[data-cw-halloween="on"] .clawd-welcome-hero>.asterisk{transition:none!important}}
@media(max-width:700px){.hw-welcome{height:58px;bottom:calc(100% + 8px)}.hw-hanging-star{top:44px}.hw-footer{font-size:10px;top:calc(100% + 5px)}}
`;
