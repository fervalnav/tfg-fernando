# Infraestructura de Hetzner para LIA

Este directorio crea únicamente la máquina virtual, su clave SSH y el firewall.
No gestiona el dominio, las credenciales de aplicación ni los secretos. La
configuración se puede revisar con Terraform u OpenTofu, pero los comandos
`apply` y `destroy` deben ejecutarse siempre de forma manual.

## Recursos previstos

- un servidor `CX23` en Núremberg con Ubuntu 24.04;
- una IPv4 y una IPv6 públicas;
- acceso SSH limitado a los CIDR indicados por el autor;
- puertos públicos 80 y 443;
- siete copias rotatorias de Hetzner;
- Docker, Compose, actualizaciones automáticas y un usuario `deploy` sin
  autenticación por contraseña;
- 2 GiB de swap para amortiguar picos durante el arranque en una máquina de
  4 GiB de memoria.

## Preparación

1. Instalar [OpenTofu](https://opentofu.org/docs/intro/install/) o Terraform.
2. Crear un proyecto en Hetzner y un token de API de lectura y escritura.
3. Generar una clave exclusiva: `ssh-keygen -t ed25519 -a 100 -f ~/.ssh/lia_hetzner`.
4. Copiar `terraform.tfvars.example` a `terraform.tfvars` y sustituir la clave y
   el CIDR de administración.
5. Exponer el token solo durante la ejecución:

   ```bash
   export HCLOUD_TOKEN="..."
   terraform init
   terraform plan
   ```

No se debe guardar `HCLOUD_TOKEN` en ningún fichero. Antes de ejecutar
`terraform apply`, revisar el plan y el precio vigente en Hetzner.

## Después de crear el servidor

Los `outputs` muestran las direcciones que deberán usar los registros DNS de
la aplicación y de los documentos. Cuando se compre el dominio, ambos nombres
apuntarán a la misma máquina. Cloud-init puede tardar varios minutos; su estado
se consulta con:

```bash
ssh deploy@IP_DEL_SERVIDOR cloud-init status --wait
```

La protección contra destrucción está activada tanto en Hetzner como en el
ciclo de vida de Terraform. Para retirar la infraestructura habrá que realizar
una modificación consciente de `main.tf`; no existe un borrado accidental con
un `destroy` directo.
