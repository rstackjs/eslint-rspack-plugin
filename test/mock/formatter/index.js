export default function format(results) {
  return JSON.stringify({
    formatter: 'mock',
    results,
  });
}
