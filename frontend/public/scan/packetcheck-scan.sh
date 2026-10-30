#!/bin/sh
# PacketCheck quick scan for macOS and Linux.
#
# Read-only: it looks, it changes nothing, and it sends nothing anywhere.
# It lists open ports, live connections, remote logins, remote-control tools,
# things that start automatically and admin accounts, then saves a report you
# can paste at packetcheck.net.
#
#   sh packetcheck-scan.sh            # quick scan as you
#   sudo sh packetcheck-scan.sh       # also names processes owned by other users

OUT="${PACKETCHECK_OUT:-$HOME/packetcheck-report.txt}"
TOOLS='teamviewer|anydesk|rustdesk|screenconnect|connectwise|splashtop|logmein|gotoassist|ammyy|vnc|x11vnc|netsupport|atera|meshagent|simplehelp|supremo|remotepc|zohoassist|dwagent|radmin|action1|kaseya|tacticalrmm|ngrok|cloudflared|chisel|frpc|frps|socat|ncat|netcat|remoting_host|chrome-remote-desktop|beyondtrust|bomgar|nomachine|nxserver|pulseway|ninjarmm|syncro|meterpreter|sliver|havoc|hoptodesk|todesk|getscreen'
OS=$(uname -s)
START=$(date +%s)

emit() {
  # Join arguments with tabs; strip tabs and newlines inside fields.
  first=1
  for f in "$@"; do
    f=$(printf '%s' "$f" | tr '\t\n\r' '   ')
    if [ $first -eq 1 ]; then printf '%s' "$f"; first=0; else printf '\t%s' "$f"; fi
  done
  printf '\n'
}

# Split "addr:port" or "addr.port" (macOS netstat) into two fields: addr<TAB>port
split_addr() {
  printf '%s\n' "$1" | awk '{
    s=$0; sub(/^\[/, "", s);
    n=match(s, /[:.][0-9*]+$/);
    if (n==0) { print s "\t"; exit }
    a=substr(s,1,n-1); p=substr(s,n+1); sub(/\]$/, "", a);
    print a "\t" p }'
}

printf '\n  PacketCheck quick scan\n  Read-only. Nothing is changed or uploaded.\n\n'

{
  echo "#PACKETCHECK v1 os=$(echo "$OS" | tr 'A-Z' 'a-z') date=$(date -u +%Y-%m-%dT%H:%M:%S)"
  if [ "$OS" = "Darwin" ]; then
    emit INFO os "macOS $(sw_vers -productVersion 2>/dev/null)"
  else
    emit INFO os "$(. /etc/os-release 2>/dev/null; echo "${PRETTY_NAME:-Linux}")"
  fi
  emit INFO elevated "$([ "$(id -u)" = "0" ] && echo 1 || echo 0)"
} > "$OUT"

echo '  [1/5] Network connections'
SEEN=$(mktemp)
if command -v lsof >/dev/null 2>&1; then
  # lsof names the owning process. Without sudo it only sees your own processes.
  lsof -nP -iTCP -sTCP:LISTEN,ESTABLISHED,SYN_SENT 2>/dev/null | awk 'NR>1' | while read -r cmd pid user fd type dev size node name state; do
    state=$(printf '%s' "$state" | tr -d '()')
    path=$(ps -o comm= -p "$pid" 2>/dev/null)
    case "$state" in
      LISTEN)
        la=$(split_addr "$name")
        emit LISTEN TCP "$(printf '%s' "$la" | cut -f1)" "$(printf '%s' "$la" | cut -f2)" "$pid" "$cmd" "$path" >> "$OUT"
        printf '%s\n' "$(printf '%s' "$la" | cut -f2)" >> "$SEEN" ;;
      ESTABLISHED|SYN_SENT)
        l=${name%%->*}; r=${name#*->}
        la=$(split_addr "$l"); ra=$(split_addr "$r")
        emit CONN TCP "$(printf '%s' "$la" | cut -f1)" "$(printf '%s' "$la" | cut -f2)" "$(printf '%s' "$ra" | cut -f1)" "$(printf '%s' "$ra" | cut -f2)" "$state" "$pid" "$cmd" "$path" >> "$OUT" ;;
    esac
  done
fi
# Listening ports owned by other users (sshd, screen sharing) that lsof could not see.
if [ "$OS" = "Darwin" ]; then
  netstat -an -p tcp 2>/dev/null | awk '$6=="LISTEN" {print $4}'
else
  (ss -tln 2>/dev/null | awk 'NR>1 {print $4}') || (netstat -tln 2>/dev/null | awk '$6=="LISTEN" {print $4}')
fi | sort -u | while read -r addr; do
  la=$(split_addr "$addr")
  port=$(printf '%s' "$la" | cut -f2)
  if ! grep -qx "$port" "$SEEN" 2>/dev/null; then
    emit LISTEN TCP "$(printf '%s' "$la" | cut -f1)" "$port" "" "" "" >> "$OUT"
    printf '%s\n' "$port" >> "$SEEN"
  fi
done
rm -f "$SEEN"

echo '  [2/5] Remote logins and sharing'
who 2>/dev/null | while read -r line; do emit SESSION "$line" >> "$OUT"; done
if [ "$OS" = "Darwin" ]; then
  launchctl print-disabled system 2>/dev/null | grep -E '"com.openssh.sshd"|"com.apple.screensharing"' | while read -r line; do emit SHARING "$line" >> "$OUT"; done
fi

echo '  [3/5] Remote-control programs'
ps -axo pid=,comm= 2>/dev/null | while read -r pid comm; do
  low=$(printf '%s' "$comm" | tr 'A-Z' 'a-z')
  if printf '%s' "$low" | grep -Eq "$TOOLS" || printf '%s' "$low" | grep -Eq '^(/tmp/|/var/tmp/|/dev/shm/|/private/tmp/)'; then
    emit PROC "$(basename "$comm")" "$pid" "$comm" >> "$OUT"
  fi
done

echo '  [4/5] Things that start automatically'
if [ "$OS" = "Darwin" ]; then
  for dir in /Library/LaunchAgents /Library/LaunchDaemons "$HOME/Library/LaunchAgents"; do
    [ -d "$dir" ] || continue
    for f in "$dir"/*.plist; do
      [ -f "$f" ] || continue
      prog=$(plutil -extract Program raw "$f" 2>/dev/null || plutil -extract ProgramArguments.0 raw "$f" 2>/dev/null)
      emit AUTORUN "$dir" "$(basename "$f")" "$prog" >> "$OUT"
    done
  done
else
  crontab -l 2>/dev/null | grep -v '^#' | grep -v '^$' | while read -r line; do emit TASK "user-crontab" "$line" >> "$OUT"; done
  for f in /etc/cron.d/*; do [ -f "$f" ] && emit TASK "/etc/cron.d" "$(basename "$f")" >> "$OUT"; done
  if command -v systemctl >/dev/null 2>&1; then
    systemctl list-unit-files --type=service --state=enabled --no-legend 2>/dev/null | awk '{print $1}' | while read -r unit; do
      exe=$(systemctl show -p ExecStart --value "$unit" 2>/dev/null | sed -n 's/.*path=\([^ ;]*\).*/\1/p')
      emit AUTORUN systemd "$unit" "$exe" >> "$OUT"
    done
  fi
  for f in "$HOME"/.config/autostart/*.desktop; do [ -f "$f" ] && emit AUTORUN autostart "$(basename "$f")" "$(grep -m1 '^Exec=' "$f" | cut -d= -f2-)" >> "$OUT"; done
fi

echo '  [5/5] Administrator accounts'
if [ "$OS" = "Darwin" ]; then
  dscl . -read /Groups/admin GroupMembership 2>/dev/null | cut -d: -f2- | tr ' ' '\n' | grep -v '^$' | while read -r u; do emit ADMIN "$u" local >> "$OUT"; done
else
  for g in sudo wheel admin; do
    getent group "$g" 2>/dev/null | cut -d: -f4 | tr ',' '\n' | grep -v '^$' | while read -r u; do emit ADMIN "$u" "$g" >> "$OUT"; done
  done
fi
if [ -f "$HOME/.ssh/authorized_keys" ]; then
  emit SSHKEYS "$HOME/.ssh/authorized_keys" "$(grep -cv '^#' "$HOME/.ssh/authorized_keys" 2>/dev/null)" >> "$OUT"
fi

END=$(date +%s)
emit INFO seconds "$((END - START))" >> "$OUT"

# Quick summary. The full read happens on packetcheck.net.
L=$(grep -c '^LISTEN' "$OUT"); C=$(grep -c '^CONN' "$OUT")
printf '\n  Done in %ss. %s open ports, %s live connections.\n' "$((END - START))" "$L" "$C"
FOUND=0
if grep -Eq "^LISTEN	[^	]*	[^	]*	(22|5900|3389)	" "$OUT"; then
  echo '  ! Remote login or screen sharing is listening (port 22, 5900 or 3389). If you did not turn it on, turn it off.'; FOUND=1
fi
if grep -Eq '^SESSION.*\([0-9a-fA-F.:]+\)' "$OUT"; then
  echo '  ! Someone is logged in from another address right now. Check the report.'; FOUND=1
fi
T=$(grep '^PROC' "$OUT" | cut -f2 | sort -u | tr '\n' ' ')
if [ -n "$T" ]; then echo "  ! Remote-control or unusual programs running: $T"; FOUND=1; fi
[ $FOUND -eq 0 ] && echo '  No obvious remote access spotted in the quick check.'

if [ -n "$PACKETCHECK_NOCLIP" ]; then :
elif command -v pbcopy >/dev/null 2>&1; then pbcopy < "$OUT" && COPIED=1
elif command -v xclip >/dev/null 2>&1; then xclip -selection clipboard < "$OUT" && COPIED=1
elif command -v wl-copy >/dev/null 2>&1; then wl-copy < "$OUT" && COPIED=1; fi

printf '\n  Report saved to: %s\n' "$OUT"
[ "${COPIED:-0}" = "1" ] && echo '  It is also on your clipboard.'
printf '  Paste it at https://packetcheck.net/#check for the full free read.\n\n'
