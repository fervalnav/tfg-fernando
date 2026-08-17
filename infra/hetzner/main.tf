locals {
  labels = {
    application = "lia"
    environment = "production"
    managed-by  = "opentofu"
  }
}

resource "hcloud_ssh_key" "deploy" {
  name       = "${var.server_name}-deploy"
  public_key = trimspace(var.ssh_public_key)
  labels     = local.labels
}

resource "hcloud_firewall" "lia" {
  name   = "${var.server_name}-firewall"
  labels = local.labels

  rule {
    direction   = "in"
    protocol    = "tcp"
    port        = "22"
    source_ips  = var.admin_cidrs
    description = "Restricted SSH administration"
  }

  rule {
    direction   = "in"
    protocol    = "tcp"
    port        = "80"
    source_ips  = ["0.0.0.0/0", "::/0"]
    description = "HTTP for ACME and HTTPS redirect"
  }

  rule {
    direction   = "in"
    protocol    = "tcp"
    port        = "443"
    source_ips  = ["0.0.0.0/0", "::/0"]
    description = "HTTPS application traffic"
  }

  rule {
    direction   = "in"
    protocol    = "icmp"
    source_ips  = ["0.0.0.0/0", "::/0"]
    description = "Path MTU discovery and diagnostics"
  }
}

resource "hcloud_server" "lia" {
  name        = var.server_name
  server_type = var.server_type
  image       = var.image
  location    = var.location
  backups     = var.enable_backups
  ssh_keys    = [hcloud_ssh_key.deploy.id]
  firewall_ids = [
    hcloud_firewall.lia.id,
  ]
  labels = local.labels

  delete_protection  = true
  rebuild_protection = true

  public_net {
    ipv4_enabled = true
    ipv6_enabled = true
  }

  user_data = templatefile("${path.module}/cloud-init.yaml.tftpl", {
    ssh_public_key = trimspace(var.ssh_public_key)
  })

  lifecycle {
    prevent_destroy = true
  }
}
