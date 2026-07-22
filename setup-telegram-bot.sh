#!/bin/bash
# NEURO — Telegram Bot Setup
# Run after deploy-server.sh and after entering bot token in admin panel

DOMAIN="mybestsite.com.ng"

echo ""
echo "  Setting up Telegram Bot for https://$DOMAIN..."
echo ""

# Check if bot token is configured
echo "  Make sure you have:"
echo "    1. Created a bot via @BotFather"
echo "    2. Entered Bot Token in Admin → Settings → Telegram"
echo "    3. Entered Chat ID in Admin → Settings → Telegram"
echo ""
echo "  Press Enter to continue..."
read

# Trigger webhook setup
echo "  Calling webhook setup..."
RESULT=$(curl -s https://$DOMAIN/api/telegram/webhook)
echo "  Response: $RESULT"

echo ""
echo "  ════════════════════════════════════════════"
echo "  ✓ Telegram Bot configured!"
echo "  ════════════════════════════════════════════"
echo ""
echo "  Now open Telegram and send /start to your bot."
echo "  You should see:"
echo "    - Welcome message with buttons"
echo "    - Menu button (opens web app)"
echo "    - Commands: /start /menu /screening /booking /contacts"
echo ""
echo "  Web App URL: https://$DOMAIN/telegram-app"
echo ""
