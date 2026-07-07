# Hello-M2M
This is a system designed for Marketing2themax where users use our kiosk to browse live information about us and what we do.

## Local preview

```bash
npm install
npm run dev
```

## Windows kiosk

```bash
npm install
npm run dev:kiosk
```

Open the kiosk browser to:

```text
http://localhost:5174/?power=low
```

`?power=low` forces the lower-spec profile: static decorative motion, no particle burst, and a capped/disabled heavy background. Use `?power=full` only on stronger hardware.

## Production build

```bash
npm run build
```
