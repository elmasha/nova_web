// plugins/wire-api.client.js
import { setFireAuth } from '~/services/api';

export default function ({ $fire }) {
  if ($fire && $fire.auth) {
    setFireAuth($fire.auth);
    console.log('[wire-api] firebase auth wired');
  }
}