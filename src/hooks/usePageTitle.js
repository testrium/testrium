// Copyright 2025-2026 Mohammad Saddam Hossain and the Testrium contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Testrium` : 'Testrium';
  }, [title]);
}
