import net from 'node:net';

const port = Number(process.argv[2] || 8001);
if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  console.error(`Invalid port: ${process.argv[2]}`);
  process.exit(2);
}

const server = net.createServer();

server.once('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(
      `Port ${port} is already in use. Please free it, or run with E2E_BASE_URL/LHCI_BASE_URL pointing to the actual dev server port.`,
    );
    process.exit(1);
  }
  console.error(err);
  process.exit(1);
});

// Bind all IPv4 interfaces to reliably detect conflicts.
server.listen(port, '0.0.0.0', () => {
  server.close(() => process.exit(0));
});

