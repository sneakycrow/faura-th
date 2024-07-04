import { Button, ButtonVariant } from "@/app/components/button";
import { Icon } from "@iconify/react";

export default () => (
  <Button variant={ButtonVariant.SPOTIFY} tag="a" href="/login/spotify">
    <Icon icon="mdi:spotify" width={32} />
    <span>Login with Spotify</span>
  </Button>
);
