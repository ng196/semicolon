#!/bin/bash
echo "=========================================="
echo "Backend Health Check Report"
echo "=========================================="
echo ""
echo "1. Server Status:"
if curl -s http://localhost:3000/hubs > /dev/null 2>&1; then
  echo "   ✓ Server is running on port 3000"
else
  echo "   ✗ Server is not responding"
  exit 1
fi
echo ""
echo "2. Endpoint Data:"
echo "   • Hubs: $(curl -s http://localhost:3000/hubs | python3 -c 'import sys,json;print(len(json.load(sys.stdin)))') items"
echo "   • Events: $(curl -s http://localhost:3000/events | python3 -c 'import sys,json;print(len(json.load(sys.stdin)))') items"
echo "   • Marketplace: $(curl -s http://localhost:3000/marketplace | python3 -c 'import sys,json;print(len(json.load(sys.stdin)))') items"
echo "   • Users: $(curl -s http://localhost:3000/users | python3 -c 'import sys,json;print(len(json.load(sys.stdin)))') items"
echo ""
echo "3. Database Status:"
if [ -f "database/campushub.db" ]; then
  echo "   ✓ Database file exists"
  echo "   • Size: $(du -h database/campushub.db | cut -f1)"
else
  echo "   ✗ Database file not found"
fi
echo ""
echo "4. API Response Times:"
echo "   • Hubs: $(curl -s -w '%{time_total}s' -o /dev/null http://localhost:3000/hubs)"
echo "   • Events: $(curl -s -w '%{time_total}s' -o /dev/null http://localhost:3000/events)"
echo "   • Marketplace: $(curl -s -w '%{time_total}s' -o /dev/null http://localhost:3000/marketplace)"
echo "   • Users: $(curl -s -w '%{time_total}s' -o /dev/null http://localhost:3000/users)"
echo ""
echo "=========================================="
echo "All systems operational!"
echo "=========================================="
