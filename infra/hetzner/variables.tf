variable "server_name" {
  description = "Name assigned to the Hetzner server and related resources."
  type        = string
  default     = "lia-production"
}

variable "server_type" {
  description = "Hetzner Cloud server type. CX23 is the low-cost default for LIA."
  type        = string
  default     = "cx23"
}

variable "location" {
  description = "Hetzner location. Nuremberg keeps the deployment in the EU."
  type        = string
  default     = "nbg1"
}

variable "image" {
  description = "Operating-system image used by the server."
  type        = string
  default     = "ubuntu-24.04"
}

variable "ssh_public_key" {
  description = "Public SSH key installed for both provisioning and the deploy user."
  type        = string
  sensitive   = true

  validation {
    condition     = can(regex("^(ssh-ed25519|sk-ssh-ed25519@openssh.com) ", trimspace(var.ssh_public_key)))
    error_message = "Use an Ed25519 SSH public key."
  }
}

variable "admin_cidrs" {
  description = "IPv4 or IPv6 CIDRs allowed to connect over SSH. Prefer a single /32 or /128 address."
  type        = list(string)

  validation {
    condition     = length(var.admin_cidrs) > 0 && !contains(var.admin_cidrs, "0.0.0.0/0") && !contains(var.admin_cidrs, "::/0")
    error_message = "Provide at least one restricted admin CIDR; unrestricted SSH is rejected."
  }
}

variable "enable_backups" {
  description = "Enable Hetzner's seven rolling server backups."
  type        = bool
  default     = true
}
