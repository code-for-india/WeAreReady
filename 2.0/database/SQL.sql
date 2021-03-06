GO
/****** Object:  Table [dbo].[AppUser]    Script Date: 5/30/2014 10:39:18 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AppUser](
	[AppUserId] [int] IDENTITY(1,1) NOT NULL,
	[AppRoleId] [int] NOT NULL,
	[Username] [nvarchar](50) NOT NULL,
	[Password] [nvarchar](50) NOT NULL,
	[LastLogin] [datetime] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_AppUser] PRIMARY KEY CLUSTERED 
(
	[AppUserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[CheckPoint]    Script Date: 5/30/2014 10:39:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CheckPoint](
	[CheckPointId] [int] IDENTITY(1,1) NOT NULL,
	[CheckPointName] [nvarchar](500) NOT NULL,
	[TypeOfCheckPoint] [int] NOT NULL,
	[Lattitude] [float] NULL,
	[Longitude] [float] NULL,
 CONSTRAINT [PK_CheckPoint] PRIMARY KEY CLUSTERED 
(
	[CheckPointId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Log]    Script Date: 5/30/2014 10:39:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Log](
	[LogId] [int] IDENTITY(1,1) NOT NULL,
	[UserProfileId] [uniqueidentifier] NOT NULL,
	[CheckPointId] [int] NOT NULL,
	[Action] [nvarchar](50) NOT NULL,
	[AppUserId] [int] NOT NULL,
	[LogTime] [datetime] NOT NULL,
 CONSTRAINT [PK_Log] PRIMARY KEY CLUSTERED 
(
	[LogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[UserProfile]    Script Date: 5/30/2014 10:39:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserProfile](
	[UserProfileId] [uniqueidentifier] NOT NULL,
	[NFCTagId] [nvarchar](50) NOT NULL,
	[FirstName] [nvarchar](150) NOT NULL,
	[LastName] [nvarchar](150) NULL,
	[Gender] [nvarchar](50) NOT NULL,
	[Age] [int] NOT NULL,
	[BloodGroup] [nvarchar](10) NULL,
	[PhoneNumber] [nchar](10) NULL,
	[GroupCount] [int] NULL,
	[EmergencyContact] [nvarchar](50) NULL,
	[EmergencyContactNumber] [nvarchar](50) NULL,
	[SMSPackPurchased] [nvarchar](50) NOT NULL,
	[FirstScanDateTime] [datetime] NOT NULL,
	[FirstCheckpointId] [int] NULL,
	[LastScanDateTime] [datetime] NULL,
	[LastCheckPointId] [int] NULL,
	[MedicalCondition] [nvarchar](max) NULL,
	[AppUserId] [int] NOT NULL,
	[TagReclaimed] [nvarchar](50) NULL,
 CONSTRAINT [PK_UserProfile] PRIMARY KEY CLUSTERED 
(
	[UserProfileId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
SET IDENTITY_INSERT [dbo].[AppUser] ON 

GO
INSERT [dbo].[AppUser] ([AppUserId], [AppRoleId], [Username], [Password], [LastLogin], [IsActive]) VALUES (1, 1, N'admin', N'pass', NULL, 1)
GO
INSERT [dbo].[AppUser] ([AppUserId], [AppRoleId], [Username], [Password], [LastLogin], [IsActive]) VALUES (2, 2, N'reg1', N'pass', NULL, 1)
GO
INSERT [dbo].[AppUser] ([AppUserId], [AppRoleId], [Username], [Password], [LastLogin], [IsActive]) VALUES (3, 3, N'cp1', N'pass', NULL, 1)
GO
INSERT [dbo].[AppUser] ([AppUserId], [AppRoleId], [Username], [Password], [LastLogin], [IsActive]) VALUES (5, 3, N'cp2', N'pass', NULL, 1)
GO
INSERT [dbo].[AppUser] ([AppUserId], [AppRoleId], [Username], [Password], [LastLogin], [IsActive]) VALUES (6, 4, N'res', N'pass', NULL, 1)
GO
INSERT [dbo].[AppUser] ([AppUserId], [AppRoleId], [Username], [Password], [LastLogin], [IsActive]) VALUES (9, 5, N'air', N'pass', NULL, 1)
GO
INSERT [dbo].[AppUser] ([AppUserId], [AppRoleId], [Username], [Password], [LastLogin], [IsActive]) VALUES (10, 6, N'doc', N'pass', NULL, 1)
GO
SET IDENTITY_INSERT [dbo].[AppUser] OFF
GO
SET IDENTITY_INSERT [dbo].[CheckPoint] ON 

GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (1, N'Haridwar', 1, 29.945691, 78.164248)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (2, N'Rishikesh', 1, 30.086928, 78.267612)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (3, N'Deo Prayag', 1, 30.145947, 78.599293)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (4, N'Srinagar', 1, 30.224476, 78.803108)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (5, N'Rudra Prayag', 1, 30.2833, 78.9833)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (6, N'Karan Prayag', 1, 30.25872, 79.218327)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (7, N'Nand Prayag', 1, 30.331976, 79.320502)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (8, N'Chamoli', 1, 30.404104, 79.331769)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (9, N'Pipal Koti', 1, 30.433526, 79.430302)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (10, N'Auli', 1, 30.528889, 79.570278)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (11, N'Joshimath ', 1, 30.550552, 79.565963)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (12, N'Tapovan', 1, 30.553872, 79.565327)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (13, N'Malari', 1, NULL, NULL)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (14, N'Govind Ghat', 1, 30.618549, 79.561705)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (15, N'Ghanghria', 1, 30.70136, 79.593352)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (16, N'Hemkund Sahib', 1, 30.699206, 79.615337)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (17, N'Valley Of Flower', 1, 30.72804, 79.605303)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (18, N'Badrinath', 1, 30.743309, 79.493763)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (19, N'Mana', 1, NULL, NULL)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (20, N'Augstmuni', 1, 30.245432, 78.924581)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (21, N'Kund', 1, NULL, NULL)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (22, N'Gupta Kashi', 1, 30.52291, 79.077714)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (23, N'Gaurikund', 1, 30.652913, 79.025658)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (24, N'Kedarnath', 1, 30.734627, 79.066894)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (25, N'Tehri', 1, 30.373861, 78.432481)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (26, N'Dharasu', 1, 30.610116, 78.32021)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (27, N'Uttar Kashi', 1, 30.7333, 78.45)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (28, N'Harsil', 1, 31.038307, 78.737702)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (29, N'Gangotri', 1, 30.994695, 78.93984)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (30, N'Bhojbasa', 1, 30.950472, 79.05144)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (31, N'Gaumukh', 1, NULL, NULL)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (32, N'Chamba', 1, 32.553363, 76.125808)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (33, N'Dhanaulti', 1, 30.426677, 78.237647)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (34, N'Mussoorie', 1, 30.455339, 78.074046)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (35, N'Dehradun', 1, 30.316495, 78.032192)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (36, N'Barkot', 1, 30.8167, 78.2)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (37, N'Hanuman Chatti', 1, 30.694772, 79.514147)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (38, N'Janki Chatti', 1, 30.975357, 78.436115)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (39, N'Yamunotri', 1, 30.996866, 78.461653)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (40, N'Max Super Speciality Hospital, Dehradun', 2, 30.373736, 78.074684)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (41, N'Himalyan Institute Hospital Trust University, Dehradun', 2, 30.316495, 78.032192)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (42, N'CMI Hospital, Dehradun', 2, 29.922599, 78.111495)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (43, N'Citi Hospital, Dehradun', 2, 30.326999, 78.03194)
GO
INSERT [dbo].[CheckPoint] ([CheckPointId], [CheckPointName], [TypeOfCheckPoint], [Lattitude], [Longitude]) VALUES (44, N'Air Ambulance', 3, 28.569661, 77.121608)
GO
SET IDENTITY_INSERT [dbo].[CheckPoint] OFF
GO
INSERT [dbo].[UserProfile] ([UserProfileId], [NFCTagId], [FirstName], [LastName], [Gender], [Age], [BloodGroup], [PhoneNumber], [GroupCount], [EmergencyContact], [EmergencyContactNumber], [SMSPackPurchased], [FirstScanDateTime], [FirstCheckpointId], [LastScanDateTime], [LastCheckPointId], [MedicalCondition], [AppUserId], [TagReclaimed]) VALUES (N'22f2263e-8644-4cec-8773-266bfc06dc89', N'046d3f62b72080', N'John', N'Doe', N'1', 25, N'O+', N'1234567890', 2, N'Jane Doe', N'1234567899', N'1', CAST(0x0000A33B00000000 AS DateTime), 1, NULL, NULL, NULL, 2, N'0')
GO
ALTER TABLE [dbo].[AppUser] ADD  CONSTRAINT [DF_AppUser_IsActive]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Log] ADD  CONSTRAINT [DF_Log_CheckIn]  DEFAULT ((1)) FOR [Action]
GO
ALTER TABLE [dbo].[Log] ADD  CONSTRAINT [DF_Log_LogTime]  DEFAULT (getdate()) FOR [LogTime]
GO
ALTER TABLE [dbo].[UserProfile] ADD  CONSTRAINT [DF_UserProfile_UserProfileId]  DEFAULT (newid()) FOR [UserProfileId]
GO
ALTER TABLE [dbo].[UserProfile] ADD  CONSTRAINT [DF_UserProfile_Gender]  DEFAULT ((1)) FOR [Gender]
GO
ALTER TABLE [dbo].[UserProfile] ADD  CONSTRAINT [DF_UserProfile_SMSPackPurchased]  DEFAULT ((0)) FOR [SMSPackPurchased]
GO
ALTER TABLE [dbo].[UserProfile] ADD  CONSTRAINT [DF_UserProfile_TagReclaimed]  DEFAULT ((0)) FOR [TagReclaimed]
GO
ALTER TABLE [dbo].[Log]  WITH CHECK ADD  CONSTRAINT [FK_Log_CheckPoint] FOREIGN KEY([CheckPointId])
REFERENCES [dbo].[CheckPoint] ([CheckPointId])
GO
ALTER TABLE [dbo].[Log] CHECK CONSTRAINT [FK_Log_CheckPoint]
GO
ALTER TABLE [dbo].[Log]  WITH CHECK ADD  CONSTRAINT [FK_Log_UserProfile] FOREIGN KEY([UserProfileId])
REFERENCES [dbo].[UserProfile] ([UserProfileId])
GO
ALTER TABLE [dbo].[Log] CHECK CONSTRAINT [FK_Log_UserProfile]
GO
