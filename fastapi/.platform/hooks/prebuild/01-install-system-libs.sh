#!/bin/bash
set -euo pipefail

dnf install -y libsndfile libsndfile-devel >/tmp/libsndfile-install.log 2>&1
