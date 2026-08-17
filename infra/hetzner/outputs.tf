output "server_ipv4" {
  description = "IPv4 address to use in the two DNS A records."
  value       = hcloud_server.lia.ipv4_address
}

output "server_ipv6" {
  description = "IPv6 address to use in the two DNS AAAA records."
  value       = hcloud_server.lia.ipv6_address
}

output "ssh_command" {
  description = "Command for the restricted deployment user."
  value       = "ssh deploy@${hcloud_server.lia.ipv4_address}"
}

output "dns_instructions" {
  description = "Records to create after choosing the application domains."
  value = {
    application = "A <APP_DOMAIN> ${hcloud_server.lia.ipv4_address}"
    files       = "A <FILES_DOMAIN> ${hcloud_server.lia.ipv4_address}"
  }
}
