---
title: "\U0001F680 Setting Up and Managing a Windows EC2 Instance with VS Code Remote SSH"
date: 2025-08-20T10:00:00.000Z
coverImage: /EC2_SSH_Cover.png
excerpt: >-
  Setting up a Windows EC2 instance on AWS doesn’t have to be complicated. In
  this guide, we’ll walk through configuring OpenSSH for secure access,
  connecting seamlessly with VS Code Remote SSH, and automating routine tasks
  like scheduled shutdowns. Whether you’re a developer looking for a powerful
  cloud workstation or someone optimizing AWS costs, this step-by-step tutorial
  will help you get up and running efficiently.
tags:
  - aws
  - EC2 Automation
  - ssh
  - vs-code
  - Task Scheduler EC2 Shutdown
---

## 🚀 Setting Up and Managing a Windows EC2 Instance with VS Code Remote SSH

Running a Windows EC2 machine on AWS can give you the flexibility of cloud resources while retaining the familiarity of the Windows environment. This guide will walk you through setting up VS Code Remote SSH, configuring security, and automating routine tasks like scheduled shutdowns.

### 🔑 Step 1: Install and Configure OpenSSH on Windows EC2

After connecting via RDP into your Windows EC2 instance:

```powershell
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'
Get-NetFirewallRule -Name *ssh*
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
Get-Service sshd
```

✅ This enables SSH access into your Windows EC2 machine.

📌 Tip: If you want to save system resources later, you can stop the SSH service using:

```powershell
Stop-Service sshd
Get-Service sshd
```

### 🌐 Step 2: Configure AWS Security Group for SSH Access

1. Go to your EC2 Dashboard → Select your instance.
2. Under the Security tab, click the Security Group ID.
3. Add a new Inbound Rule:
   * Type: SSH
   * Protocol: TCP
   * Port Range: 22
   * Source: Anywhere (IPv4)

Restart the instance once to be safe.

```mermaid
flowchart TD
    A[Local Machine] -->|SSH Port 22| B[EC2 Security Group]
    B --> C[Windows EC2 Instance]
    C --> D[OpenSSH Service Running]
```

### 💻 Step 3: Set Up Local SSH Config on Mac

On your local machine (MacOS), edit your \~/.ssh/config file:  

```
Host win-ec2
  HostName ec2-public_ipv4_address.ap-south-1.compute.amazonaws.com
  User Administrator
  IdentityFile /Users/username/Downloads/ec2_key.pem

```

Also update permissions for the key file:  
